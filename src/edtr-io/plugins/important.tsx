import { child, EditorPlugin, EditorPluginProps } from '@/serlo-editor/plugin'
import { styled } from '@/serlo-editor/renderer-ui'

export const importantState = child({ plugin: 'text' })
export type ImportantPluginState = typeof importantState
export type ImportantProps = EditorPluginProps<ImportantPluginState>

export function createImportantPlugin(): EditorPlugin<ImportantPluginState> {
  return {
    Component: ImportantRenderer,
    config: {},
    state: importantState,
  }
}

const Box = styled.div({
  borderLeft: '#bedfed solid 5px',
  paddingLeft: '15px',
})

function ImportantRenderer(props: ImportantProps) {
  return <Box>{props.state.render()}</Box>
}
