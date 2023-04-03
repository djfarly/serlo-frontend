import { invariant } from '../../internal__dev-expression'
import {
  StateUpdater,
  StoreDeserializeHelpers,
} from '../../internal__plugin-state'
import { channel, Channel } from 'redux-saga'
import { all, call, put, select, take, takeEvery } from 'redux-saga/effects'
import generate from 'shortid'

import { ReversibleAction } from '../actions'
import { scopeSelector } from '../helpers'
import { commit, temporaryCommit } from '../history/actions'
import { getPlugin } from '../plugins/reducer'
import { SelectorReturnType } from '../storetypes'
import {
  change,
  ChangeAction,
  insert,
  InsertAction,
  pureChange,
  PureChangeAction,
  pureInsert,
  pureRemove,
  pureReplace,
  PureReplaceAction,
  pureUnwrap,
  PureUnwrapAction,
  pureWrap,
  PureWrapAction,
  remove,
  RemoveAction,
  replace,
  ReplaceAction,
  replaceText,
  ReplaceTextAction,
  pureReplaceText,
  PureReplaceTextAction,
  unwrap,
  UnwrapAction,
  wrap,
  WrapAction,
} from './actions'
import { getDocument } from './reducer'

export function* documentsSaga() {
  yield all([
    takeEvery(insert.type, insertSaga),
    takeEvery(remove.type, removeSaga),
    takeEvery(change.type, changeSaga),
    takeEvery(wrap.type, wrapSaga),
    takeEvery(unwrap.type, unwrapSaga),
    takeEvery(replace.type, replaceSaga),
    takeEvery(replaceText.type, replaceTextSaga),
  ])
}

function* insertSaga(action: InsertAction) {
  const initialState = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [actions]: [ReversibleAction[], unknown] = yield call(
    handleRecursiveInserts,
    action.scope,
    () => {},
    [initialState]
  )
  yield put(commit(actions)(action.scope))
}

function* removeSaga(action: RemoveAction) {
  const id = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const doc: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  if (!doc) return

  const actions: ReversibleAction[] = [
    {
      action: pureRemove(id)(action.scope),
      reverse: pureInsert({
        id,
        plugin: doc.plugin,
        state: doc.state,
      })(action.scope),
    },
  ]
  yield put(commit(actions)(action.scope))
}

function* changeSaga(action: ChangeAction) {
  const { id, state: stateHandler, reverse } = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const document: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  if (!document) return

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [actions, state]: [ReversibleAction[], unknown] = yield call(
    handleRecursiveInserts,
    action.scope,
    (helpers: StoreDeserializeHelpers) => {
      return stateHandler.initial(document.state, helpers)
    }
  )

  const createChange = (
    state: unknown
  ): ReversibleAction<PureChangeAction, PureChangeAction> => {
    return {
      action: pureChange({ id, state })(action.scope),
      reverse: pureChange({
        id,
        state:
          typeof reverse === 'function'
            ? reverse(document.state)
            : document.state,
      })(action.scope),
    }
  }

  actions.push(createChange(state))

  if (!stateHandler.executor) {
    yield put(commit(actions)(action.scope))
  } else {
    // async change, handle with stateHandler.resolver

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const chan: Channel<ChannelAction> = yield call(channel)

    yield put(
      temporaryCommit({
        initial: actions,
        executor: (resolve, reject, next) => {
          if (!stateHandler.executor) {
            resolve(actions)
            return
          }

          stateHandler.executor(
            function stateResolve(updater) {
              chan.put({
                resolve: updater,
                scope: action.scope,
                callback: (resolveActions, state) => {
                  resolve([...resolveActions, createChange(state)])
                },
              })
            },
            function stateReject(updater) {
              chan.put({
                reject: updater,
                scope: action.scope,
                callback: (resolveActions, state) => {
                  reject([...resolveActions, createChange(state)])
                },
              })
            },
            function stateNext(updater) {
              chan.put({
                next: updater,
                scope: action.scope,
                callback: (resolveActions, state) => {
                  next([...resolveActions, createChange(state)])
                },
              })
            }
          )
        },
      })(action.scope)
    )

    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload: ChannelAction = yield take(chan)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const currentDocument: SelectorReturnType<typeof getDocument> =
        yield select(scopeSelector(getDocument, action.scope), id)
      if (!currentDocument) continue

      const updater =
        payload.resolve || payload.next || payload.reject || ((s) => s)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [resolveActions, pureResolveState]: [ReversibleAction[], unknown] =
        yield call(
          handleRecursiveInserts,
          action.scope,
          (helpers: StoreDeserializeHelpers) => {
            return updater(currentDocument.state, helpers)
          }
        )
      payload.callback(resolveActions, pureResolveState)
      if (payload.resolve || payload.reject) {
        break
      }
    }
  }
}

function* wrapSaga(action: WrapAction) {
  const { id, document: documentHandler } = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentDocument: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  const newId = generate()
  if (!currentDocument) return
  const reversibleAction: ReversibleAction<PureWrapAction, PureUnwrapAction> = {
    action: pureWrap({ id, newId, document: documentHandler(newId) })(
      action.scope
    ),
    reverse: pureUnwrap({ id, oldId: newId })(action.scope),
  }
  yield put(commit([reversibleAction])(action.scope))
}

function* unwrapSaga(action: UnwrapAction) {
  const { id, oldId } = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentDocument: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  if (!currentDocument) return
  const reversibleAction: ReversibleAction<PureUnwrapAction, PureWrapAction> = {
    action: pureUnwrap({ id, oldId })(action.scope),
    reverse: pureWrap({
      id,
      newId: oldId,
      document: currentDocument,
    })(action.scope),
  }
  yield put(commit([reversibleAction])(action.scope))
}

function* replaceSaga(action: ReplaceAction) {
  const { id } = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentDocument: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  if (!currentDocument) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // @ts-ignore see line above
  const plugin: SelectorReturnType<typeof getPlugin> = yield select(
    scopeSelector(getPlugin, action.scope),
    action.payload.plugin
  )
  if (!plugin) return
  const pendingDocs: {
    id: string
    plugin: string
    state?: unknown
  }[] = []
  const helpers: StoreDeserializeHelpers = {
    createDocument(doc) {
      pendingDocs.push(doc)
    },
  }
  let pluginState: unknown
  if (action.payload.state === undefined) {
    pluginState = plugin.state.createInitialState(helpers)
  } else {
    pluginState = plugin.state.deserialize(action.payload.state, helpers)
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [actions]: [ReversibleAction[], unknown] = yield call(
    handleRecursiveInserts,
    action.scope,
    () => {},
    pendingDocs
  )

  const reversibleAction: ReversibleAction<
    PureReplaceAction,
    PureReplaceAction
  > = {
    action: pureReplace({
      id,
      plugin: action.payload.plugin,
      state: pluginState,
    })(action.scope),
    reverse: pureReplace({
      id,
      plugin: currentDocument.plugin,
      state: currentDocument.state,
    })(action.scope),
  }
  yield put(commit([...actions, reversibleAction])(action.scope))
}

function* replaceTextSaga(action: ReplaceTextAction) {
  const { id, document: documentHandler } = action.payload
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentDocument: SelectorReturnType<typeof getDocument> = yield select(
    scopeSelector(getDocument, action.scope),
    id
  )
  const newId = generate()

  // TODO: give previous doc new id
  // TODO: pass new id to document handler
  if (!currentDocument) return
  const reversibleAction: ReversibleAction<
    PureReplaceTextAction,
    PureReplaceTextAction
  > = {
    action: pureReplaceText({ id, newId, document: documentHandler(newId) })(
      action.scope
    ),
    // TODO: here, we should delete the document with newId
    reverse: pureReplaceText({
      id: newId,
      newId: id,
      document: currentDocument,
    })(action.scope),
  }
  yield put(commit([reversibleAction])(action.scope))
}

interface ChannelAction {
  resolve?: StateUpdater<unknown>
  next?: StateUpdater<unknown>
  reject?: StateUpdater<unknown>
  scope: string
  callback: (actions: ReversibleAction[], pureState: unknown) => void
}

export function* handleRecursiveInserts(
  scope: string,
  act: (helpers: StoreDeserializeHelpers) => unknown,
  initialDocuments: { id: string; plugin: string; state?: unknown }[] = []
) {
  const actions: ReversibleAction[] = []
  const pendingDocs: {
    id: string
    plugin: string
    state?: unknown
  }[] = initialDocuments
  const helpers: StoreDeserializeHelpers = {
    createDocument(doc) {
      pendingDocs.push(doc)
    },
  }
  const result = act(helpers)
  for (let doc; (doc = pendingDocs.pop()); ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // @ts-ignore see line above
    const plugin: SelectorReturnType<typeof getPlugin> = yield select(
      scopeSelector(getPlugin, scope),
      doc.plugin
    )
    if (!plugin) {
      invariant(false, `Invalid plugin '${doc.plugin}'`)
      continue
    }
    let state: unknown
    if (doc.state === undefined) {
      state = plugin.state.createInitialState(helpers)
    } else {
      state = plugin.state.deserialize(doc.state, helpers)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const currentDocument: SelectorReturnType<typeof getDocument> =
      yield select(scopeSelector(getDocument, scope), doc.id)
    if (currentDocument) {
      actions.push({
        action: pureReplace({
          id: doc.id,
          plugin: doc.plugin,
          state,
        })(scope),
        reverse: pureReplace({
          id: doc.id,
          plugin: currentDocument.plugin,
          state: currentDocument.state,
        })(scope),
      })
    } else {
      actions.push({
        action: pureInsert({
          id: doc.id,
          plugin: doc.plugin,
          state,
        })(scope),
        reverse: pureRemove(doc.id)(scope),
      })
    }
  }
  return [actions, result] as [ReversibleAction[], unknown]
}
