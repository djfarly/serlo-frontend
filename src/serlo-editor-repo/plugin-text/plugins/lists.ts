import {
  ListType,
  withLists as withListsPlugin,
  withListsReact,
} from '@prezly/slate-lists'
import { Editor as SlateEditor, Element, Node } from 'slate'

import {
  List,
  ListElementType,
  ListItem,
  ListItemText,
  Paragraph,
} from '../types'

export const withLists = (editor: SlateEditor) => {
  const editorWithListsPlugin = withListsPlugin({
    isConvertibleToListTextNode(node: Node) {
      return Element.isElementType(node, 'p')
    },
    isDefaultTextNode(node: Node) {
      return Element.isElementType(node, 'p')
    },
    isListNode(node: Node, type?: ListType) {
      if (type) {
        return Element.isElementType(node, type)
      }
      return (
        Element.isElementType(node, ListElementType.ORDERED_LIST) ||
        Element.isElementType(node, ListElementType.UNORDERED_LIST)
      )
    },
    isListItemNode(node: Node) {
      return Element.isElementType(node, ListElementType.LIST_ITEM)
    },
    isListItemTextNode(node: Node) {
      return Element.isElementType(node, ListElementType.LIST_ITEM_TEXT)
    },
    createDefaultTextNode(props = {}) {
      return { children: [{ text: '' }], ...props, type: 'p' } as Paragraph
    },
    createListNode(type: ListType = ListType.UNORDERED, props = {}) {
      const nodeType =
        type === ListType.ORDERED
          ? ListElementType.ORDERED_LIST
          : ListElementType.UNORDERED_LIST
      return { children: [{ text: '' }], ...props, type: nodeType } as List
    },
    createListItemNode(props = {}) {
      return {
        children: [{ text: '' }],
        ...props,
        type: ListElementType.LIST_ITEM,
      } as ListItem
    },
    createListItemTextNode(props = {}) {
      return {
        children: [{ text: '' }],
        ...props,
        type: ListElementType.LIST_ITEM_TEXT,
      } as ListItemText
    },
  })

  return withListsReact(editorWithListsPlugin(editor))
}
