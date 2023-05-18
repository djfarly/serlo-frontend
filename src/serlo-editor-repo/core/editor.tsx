import { useMemo, useEffect, ReactNode, useContext, ContextType } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { configure, GlobalHotKeys } from 'react-hotkeys'

import { createDefaultDocumentEditor } from '../default-document-editor'
import { createDefaultPluginToolbar } from '../default-plugin-toolbar'
import { EditorPlugin } from '../internal__plugin'
import {
  initRoot,
  undo,
  redo,
  getPendingChanges,
  getRoot,
  hasPendingChanges,
  serializeRootDocument,
  createStore,
  ChangeListener,
} from '../store'
import {
  DocumentEditorContext,
  PreferenceContextProvider,
  PluginToolbarContext,
} from './contexts'
import {
  Provider,
  EditorContext,
  EditableContext,
  ErrorContext,
  useSelector,
  useDispatch,
  useStore,
} from './store'
import { SubDocument } from './sub-document'

configure({
  ignoreEventsCondition() {
    return false
  },
})

const DefaultDocumentEditor = createDefaultDocumentEditor()
const DefaultPluginToolbar = createDefaultPluginToolbar()

let mountedProvider = false

/**
 * Renders a single editor for an Edtr.io document
 */
export function Editor<K extends string = string>(props: EditorProps<K>) {
  const store = useMemo(() => {
    return createStore().store
  }, [])

  return <Provider store={store}>{renderChildren()}</Provider>

  function renderChildren() {
    const children = (
      <InnerDocument
        {...props}
        editable={props.editable === undefined ? true : props.editable}
      />
    )
    if (props.omitDragDropContext) return children
    return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  }
}

/**
 * Hydrates the required contexts
 */
export function EditorProvider(props: EditorProviderProps) {
  const { omitDragDropContext, children }: EditorProviderProps = props
  useEffect(() => {
    if (mountedProvider) {
      // eslint-disable-next-line no-console
      console.error('You may only render one <EditorProvider />.')
    }
    mountedProvider = true
    return () => {
      mountedProvider = false
    }
  }, [])
  const store = useMemo(() => {
    return createStore().store
  }, [])

  const child = <Provider store={store}>{children}</Provider>
  if (omitDragDropContext) return child
  return <DndProvider backend={HTML5Backend}>{child}</DndProvider>
}
export interface EditorProviderProps {
  omitDragDropContext?: boolean
  children: ReactNode
}

/**
 * Renders an editor for an Edtr.io document
 * @param props - The {@link EditorProps | props} for the document
 */
export function Document<K extends string = string>(
  props: Omit<EditorProps<K>, 'initialState'> &
    (
      | { mirror: true; initialState?: unknown }
      | { mirror?: false; initialState: EditorProps<K>['initialState'] }
    )
) {
  const storeContext = useContext(EditorContext)

  if (!storeContext) {
    // eslint-disable-next-line no-console
    console.error(
      'Could not connect to Redux Store. Please make sure to wrap all instances of Document in an EditorProvider'
    )
    return null
  }

  return <InnerDocument {...props} />
}

const hotKeysKeyMap = {
  UNDO: ['ctrl+z', 'command+z'],
  REDO: ['ctrl+y', 'command+y', 'ctrl+shift+z', 'command+shift+z'],
}

export function InnerDocument<K extends string = string>({
  children,
  plugins,
  editable,
  onChange,
  onError,
  DocumentEditor = DefaultDocumentEditor,
  PluginToolbar = DefaultPluginToolbar,
  ...props
}: Omit<EditorProps<K>, 'initialState'> &
  (
    | { mirror: true; initialState?: unknown }
    | { mirror?: false; initialState: EditorProps<K>['initialState'] }
  )) {
  const id = useSelector((state) => {
    return getRoot()(state)
  })
  const dispatch = useDispatch()
  const fullStore = useStore()
  useEffect(() => {
    if (typeof onChange !== 'function') return
    let pendingChanges = getPendingChanges()(fullStore.getState())
    return fullStore.subscribe(() => {
      const currentPendingChanges = getPendingChanges()(fullStore.getState())
      if (currentPendingChanges !== pendingChanges) {
        onChange({
          changed: hasPendingChanges()(fullStore.getState()),
          getDocument: () => serializeRootDocument()(fullStore.getState()),
        })
        pendingChanges = currentPendingChanges
      }
    })
  }, [onChange, fullStore])

  useEffect(() => {
    if (!props.mirror) {
      dispatch(initRoot({ initialState: props.initialState, plugins }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialState, plugins, props.mirror])
  const editableContextValue = useMemo(() => editable ?? true, [editable])
  const hotKeysHandlers = useMemo(
    () => ({
      UNDO: () => dispatch(undo()),
      REDO: () => dispatch(redo()),
    }),
    [dispatch]
  )

  if (!id) return null

  return (
    <GlobalHotKeys
      allowChanges
      keyMap={hotKeysKeyMap}
      handlers={hotKeysHandlers}
    >
      <div style={{ position: 'relative' }}>
        <ErrorContext.Provider value={onError}>
          <DocumentEditorContext.Provider value={DocumentEditor}>
            <PluginToolbarContext.Provider value={PluginToolbar}>
              <PreferenceContextProvider>
                <EditableContext.Provider value={editableContextValue}>
                  {renderChildren(id)}
                </EditableContext.Provider>
              </PreferenceContextProvider>
            </PluginToolbarContext.Provider>
          </DocumentEditorContext.Provider>
        </ErrorContext.Provider>
      </div>
    </GlobalHotKeys>
  )

  function renderChildren(id: string) {
    const document = <SubDocument id={id} />

    if (typeof children === 'function') {
      return children(document)
    }

    return (
      <>
        {document}
        {children}
      </>
    )
  }
}

export interface EditorProps<K extends string = string> {
  omitDragDropContext?: boolean
  children?: ReactNode | ((document: ReactNode) => ReactNode)
  plugins: Record<K, EditorPlugin>
  initialState: {
    plugin: string
    state?: unknown
  }
  onChange?: ChangeListener
  editable?: boolean
  onError?: ContextType<typeof ErrorContext>
  DocumentEditor?: ContextType<typeof DocumentEditorContext>
  PluginToolbar?: ContextType<typeof PluginToolbarContext>
}
