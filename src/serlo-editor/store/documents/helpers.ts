import { ChildTreeNode } from './types'
import { ROOT } from '../root/constants'
import { DocumentState } from '../types'
import type { StoreSerializeHelpers } from '@/serlo-editor/plugin'
import { editorPlugins } from '@/serlo-editor/plugin/helpers/editor-plugins'

export function getChildTree(
  documents: Record<string, DocumentState>,
  id: string = ROOT
): ChildTreeNode {
  const document = documents[id]
  const plugin = editorPlugins.getByType(document.plugin)

  const children = plugin.state
    .getFocusableChildren(document.state)
    .map((child) => {
      const subtree = getChildTree(documents, child.id)
      return subtree || child
    })

  return { id, children }
}

export function findChildTreeNodeParentById(
  root: ChildTreeNode,
  id: string
): ChildTreeNode | null {
  if (root.id === id) {
    return root
  }

  const children = root.children || []
  for (let i = 0; i < children.length; i++) {
    const resolved = findChildTreeNodeParentById(children[i], id)

    if (resolved) {
      if (resolved.id === id) {
        return root
      }
      return resolved
    }
  }

  return null
}

interface getStaticDocumentArgs {
  documents: Record<string, DocumentState>
  id: string
  omitId?: boolean
}

export function getStaticDocument({
  documents,
  id,
  omitId = false,
}: getStaticDocumentArgs) {
  const document = documents[id]
  const plugin = editorPlugins.getByType(document.plugin)

  const serializeHelpers: StoreSerializeHelpers = {
    getDocument: (id: string) => getStaticDocument({ documents, id, omitId }),
    omitId,
  }

  return {
    plugin: document.plugin,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    state: plugin.state.toStatic(document.state, serializeHelpers),
  }
}
