import * as R from 'ramda'
import { channel, Channel } from 'redux-saga'
import { all, call, put, select, take, takeEvery } from 'redux-saga/effects'

import { EditorPlugin } from '../../types/internal__plugin'
import { runChangeDocumentSaga, selectDocument } from '../documents'
import { selectFocusTree } from '../focus'
import { selectPlugin } from '../plugins'
import {
  insertPluginChildAfter,
  insertPluginChildBefore,
  removePluginChild,
} from './saga-actions'

export function* pluginSaga() {
  yield all([
    takeEvery(insertPluginChildBefore, insertChildBeforeSaga),
    takeEvery(insertPluginChildAfter, insertChildAfterSaga),
    takeEvery(removePluginChild, removeChildSaga),
  ])
}

function* insertChildBeforeSaga({
  payload,
}: ReturnType<typeof insertPluginChildBefore>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parent: ReturnType<typeof selectFocusTree> = yield select(
    selectFocusTree,
    payload.parent
  )
  if (!parent || !parent.children) return
  const index = R.findIndex(
    (child) => child.id === payload.sibling,
    parent.children
  )
  if (index === -1) return
  yield call(insertChild, {
    parent: payload.parent,
    previousSibling: index === 0 ? undefined : parent.children[index - 1].id,
    document: payload.document,
  })
}

function* insertChildAfterSaga({
  payload,
}: ReturnType<typeof insertPluginChildAfter>) {
  yield call(insertChild, {
    parent: payload.parent,
    previousSibling: payload.sibling,
    document: payload.document,
  })
}

function* removeChildSaga({ payload }: ReturnType<typeof removePluginChild>) {
  yield call(createPlugin, payload.parent, (plugin, state) => {
    if (typeof plugin.removeChild !== 'function') return
    plugin.removeChild(state, payload.child)
  })
}

function* insertChild(payload: {
  parent: string
  previousSibling?: string
  document?: { plugin: string; state?: unknown }
}) {
  yield call(createPlugin, payload.parent, (plugin, state) => {
    if (typeof plugin.insertChild !== 'function') return
    plugin.insertChild(state, {
      previousSibling: payload.previousSibling,
      document: payload.document,
    })
  })
}

function* createPlugin(
  id: string,
  f: (plugin: EditorPlugin, state: unknown) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const document: ReturnType<typeof selectDocument> = yield select(
    selectDocument,
    id
  )
  if (!document) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const plugin: ReturnType<typeof selectPlugin> = yield select(
    selectPlugin,
    document.plugin
  )
  if (!plugin) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const chan: Channel<{ payload: unknown; type: string }> = yield call(channel)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const state = plugin.state.init(document.state, (initial, additional) => {
    const action = runChangeDocumentSaga({
      id,
      state: {
        initial,
        executor: additional?.executor,
      },
      reverse: additional?.reverse,
    })
    chan.put(action)
  })
  f(plugin, state)
  chan.close()
  yield call(channelSaga, chan)

  function* channelSaga(chan: Channel<{ payload: unknown; type: string }>) {
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const action: ReturnType<typeof runChangeDocumentSaga> = yield take(chan)
      yield put(action)
    }
  }
}
