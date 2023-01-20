// eslint-disable-next-line import/no-internal-modules
import { Editor, EditorProps } from '@edtr-io/core/beta'
// eslint-disable-next-line import/no-internal-modules
import { createDefaultDocumentEditor } from '@edtr-io/default-document-editor/beta'
import { Entity, UuidType } from '@serlo/authorization'
import { createContext, ReactNode, useState } from 'react'

import { getPluginRegistry } from './get-plugin-registry'
import { createPlugins } from './plugins'
import { useCanDo } from '@/auth/use-can-do'
import { MathSpan } from '@/components/content/math-span'
import { LoadingSpinner } from '@/components/loading/loading-spinner'
import { useInstanceData } from '@/contexts/instance-context'
import { useLoggedInData } from '@/contexts/logged-in-data-context'
import { SetEntityMutationData } from '@/mutations/use-set-entity-mutation/types'

export interface SerloEditorProps {
  children?: ReactNode
  entityNeedsReview: boolean
  onSave: (data: SetEntityMutationData) => Promise<void>
  onError?: (error: Error, context: Record<string, string>) => void
  initialState: EditorProps['initialState'] // expects "deserialized" state now
  type: UuidType
}

export interface LooseEdtrData {
  [key: string]: EditorProps['initialState'] | null | undefined
}

export interface LooseEdtrDataDefined {
  [key: string]: EditorProps['initialState']
}

export const SaveContext = createContext<{
  onSave: SerloEditorProps['onSave']
  userCanSkipReview: boolean
  entityNeedsReview: boolean
}>({
  onSave: () => Promise.reject(),
  userCanSkipReview: false,
  entityNeedsReview: true,
})

export function SerloEditor({
  onSave,
  entityNeedsReview,
  onError,
  initialState,
  children,
  type,
}: SerloEditorProps) {
  const canDo = useCanDo()
  const userCanSkipReview = canDo(Entity.checkoutRevision)
  const [useStored, setUseStored] = useState(false)
  const { strings } = useInstanceData()
  const loggedInData = useLoggedInData()
  if (!loggedInData)
    return (
      <div className="text-center">
        <LoadingSpinner />
      </div>
    )

  const editorStrings = loggedInData.strings.editor

  const plugins = createPlugins({
    registry: getPluginRegistry(type, editorStrings),
    type,
    editorStrings,
    strings,
  })

  const DocumentEditor = createDefaultDocumentEditor({
    i18n: {
      settings: {
        buttonLabel: editorStrings.edtrIo.settings,
        modalTitle: editorStrings.edtrIo.extendedSettings,
        modalCloseLabel: editorStrings.edtrIo.close,
      },
    },
  })

  const stored = getStateFromLocalStorage()

  return (
    // eslint-disable-next-line @typescript-eslint/unbound-method
    <SaveContext.Provider
      value={{ onSave, userCanSkipReview, entityNeedsReview }}
    >
      {stored ? (
        <div className="bg-brand-100 rounded-2xl m-side mt-12 p-side">
          {useStored ? (
            <>
              Wieder zurück zum Ausgangszustand (Vorsicht, deine Änderungen
              gehen dabei verloren){' '}
              <button
                className="serlo-button-blue mt-2"
                onClick={() => {
                  storeStateToLocalStorage(undefined)
                  setUseStored(false)
                }}
              >
                Änderungen verwerfen
              </button>
            </>
          ) : (
            <>
              {editorStrings.edtrIo.oldRevisionFound}{' '}
              <button
                className="serlo-button-blue mt-2"
                onClick={() => {
                  setUseStored(true)
                }}
              >
                Load it now
              </button>
            </>
          )}
        </div>
      ) : null}
      <MathSpan formula="" /> {/* preload formula plugin */}
      <Editor
        DocumentEditor={DocumentEditor}
        onError={onError}
        plugins={plugins}
        initialState={stored && useStored ? stored : initialState}
        editable
      >
        {children}
      </Editor>
      <style jsx global>{`
        /* fixes bug in chromium based browsers v105+ */
        /* https://github.com/ianstormtaylor/slate/issues/5110#issuecomment-1234951122 */
        div[data-slate-editor] {
          -webkit-user-modify: read-write !important;
        }
      `}</style>
    </SaveContext.Provider>
  )
}

function getStateFromLocalStorage() {
  const edtr = localStorage.getItem('edtr')
  if (!edtr) return

  const storedStates = JSON.parse(edtr) as LooseEdtrData
  return storedStates[window.location.pathname]
}

export function storeStateToLocalStorage(
  state?: EditorProps['initialState'] | null
) {
  const currentValue = localStorage.getItem('edtr')
  const edtr = currentValue ? (JSON.parse(currentValue) as LooseEdtrData) : {}

  edtr[window.location.pathname] = state

  localStorage.setItem('edtr', JSON.stringify(edtr))
}
