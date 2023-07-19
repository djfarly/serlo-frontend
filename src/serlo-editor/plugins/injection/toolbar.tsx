import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { Dispatch, SetStateAction } from 'react'

import { InjectionProps } from '.'
import { EditorInput } from '../../editor-ui'
import { FaIcon } from '@/components/fa-icon'
import { ModalWithCloseButton } from '@/components/modal-with-close-button'
import { useEditorStrings } from '@/contexts/logged-in-data-context'
import { PluginToolbar } from '@/serlo-editor/core/plugin-toolbar'
import { DefaultControls } from '@/serlo-editor/core/plugin-toolbar/dropdown/default-controls'
import { EditorPluginType } from '@/serlo-editor-integration/types/editor-plugin-type'

export const InjectionToolbar = ({
  id,
  state,
  showSettingsModal,
  setShowSettingsModal,
}: InjectionProps & {
  showSettingsModal: boolean
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>
}) => {
  const injectionStrings = useEditorStrings().plugins.injection

  return (
    <PluginToolbar
      pluginId={id}
      pluginType={EditorPluginType.Injection}
      pluginSettings={
        <>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="mr-2 rounded-md border border-gray-500 px-1 text-sm transition-all hover:bg-editor-primary-200 focus-visible:bg-editor-primary-200"
          >
            {injectionStrings.serloId} <FaIcon icon={faPencilAlt} />
          </button>
          {/* In the future we want a popovers per setting, but this is faster for now */}
          {showSettingsModal ? (
            <ModalWithCloseButton
              isOpen={showSettingsModal}
              onCloseClick={() => setShowSettingsModal(false)}
              className="!top-1/3 !max-w-xl"
            >
              <h3 className="serlo-h3 mt-4">{injectionStrings.title}</h3>

              <div className="mx-side mb-3">
                <EditorInput
                  label={`${injectionStrings.serloId}: `}
                  placeholder={injectionStrings.placeholder}
                  inputMode="numeric"
                  pattern="\d+"
                  value={state.value}
                  onChange={(e) =>
                    state.set(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  width="100%"
                  inputWidth="100%"
                  className="block"
                />
              </div>
            </ModalWithCloseButton>
          ) : null}
        </>
      }
      pluginControls={<DefaultControls pluginId={id} />}
    />
  )
}
