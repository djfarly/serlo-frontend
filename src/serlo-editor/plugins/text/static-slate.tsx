import { createElement, useContext } from 'react'
import { Descendant, Element } from 'slate'

import { TextLeafRenderer } from './components/text-leaf-renderer'
import { ListElementType } from './types/text-editor'
import { GapModeContext } from '../fill-in-the-gap-exercise/context/gap-mode'
import { GapRenderer } from '../fill-in-the-gap-exercise/gap-renderer'
import { editorRenderers } from '@/serlo-editor/plugin/helpers/editor-renderer'

export function StaticSlate({
  element,
}: {
  element: Descendant | Descendant[]
}): JSX.Element | null {
  const gapMode = useContext(GapModeContext)

  if (Array.isArray(element))
    return (
      <>
        {element.map((item, index) => (
          <StaticSlate key={index} element={item} />
        ))}
      </>
    )

  if (Object.hasOwn(element, 'type')) {
    const { children } = element

    if (element.type === 'h') {
      const classNames = [
        'serlo-h1',
        'serlo-h2',
        'serlo-h3',
        'serlo-p font-bold mb-0 mt-4', // h4 fallback
      ]
      return createElement(
        `h${element.level}`,
        { className: classNames[element.level - 1] },
        <>
          <StaticSlate element={children} />
        </>
      )
    }
    if (element.type === 'a') {
      const LinkRenderer = editorRenderers.getLinkRenderer()
      return (
        <LinkRenderer href={element.href}>
          <StaticSlate element={children} />
        </LinkRenderer>
      )
    }
    if (element.type === ListElementType.UNORDERED_LIST) {
      return (
        <ul className="serlo-ul">
          <StaticSlate element={children} />
        </ul>
      )
    }
    if (element.type === ListElementType.ORDERED_LIST) {
      return (
        <ol className="serlo-ol">
          <StaticSlate element={children} />
        </ol>
      )
    }
    if (element.type === ListElementType.LIST_ITEM) {
      return (
        <li>
          <StaticSlate element={children} />
        </li>
      )
    }
    if (element.type === ListElementType.LIST_ITEM_TEXT) {
      // "list-item-child"

      // TODO: maybe write migration or formatter for this?
      // compat: unwrap old content where a list item is wrapped inside another p in state
      const elementChild =
        children.length === 1 && Object.hasOwn(children[0], 'type')
          ? (children[0] as unknown as Element)
          : undefined
      const unwrapped =
        elementChild?.type === 'p' ? elementChild.children : children

      return (
        <p className="slate-p serlo-p mb-0 ml-0 min-h-[1.33em]">
          <StaticSlate element={unwrapped} />
        </p>
      )
    }
    if (element.type === 'math') {
      const MathRenderer = editorRenderers.getMathRenderer()
      return <MathRenderer {...element} />
    }
    if (element.type === 'gap') {
      return (
        <GapRenderer
          mode={gapMode ? gapMode : 'fill-in-the-gap'}
          correctAnswer={element.correctAnswer}
          id={element.id}
        />
      )
    }

    // unwrap block level math elements
    if (
      element.children.length === 1 &&
      Object.hasOwn(element.children[0], 'type') &&
      element.children[0].type === 'math' &&
      element.children[0].inline === false
    ) {
      return <StaticSlate element={children} />
    }

    return (
      <p className="slate-p serlo-p mb-0 min-h-[1.33em]">
        <StaticSlate element={children} />
      </p>
    )
  }

  return <TextLeafRenderer leaf={element}>{element.text}</TextLeafRenderer>
}
