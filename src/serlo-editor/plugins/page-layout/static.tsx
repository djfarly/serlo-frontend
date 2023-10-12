import { PageLayoutRenderer } from './renderer'
import { StaticRenderer } from '@/serlo-editor/static-renderer/static-renderer'
import type { EditorPageLayoutDocument } from '@/serlo-editor-integration/types/editor-plugins'

export interface PageLayoutRendererProps {
  widthPercent: number // for first column
  column1: JSX.Element
  column2: JSX.Element
}

export const PageLayoutStaticRenderer = ({ state }: EditorPageLayoutDocument) => {
  const { widthPercent, column1, column2 } = state

  return (
    <PageLayoutRenderer
      widthPercent={widthPercent}
      column1={<StaticRenderer document={column1} />}
      column2={<StaticRenderer document={column2} />}
    />
  )
}
