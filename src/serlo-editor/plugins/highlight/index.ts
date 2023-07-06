import { HighlightEditor } from './editor'
import { HighlightRenderer, HighlightRendererProps } from './renderer'
import {
  boolean,
  EditorPlugin,
  EditorPluginProps,
  object,
  string,
} from '@/serlo-editor/plugin'

export interface HighlightConfig {
  Renderer?: HighlightPluginConfig['Renderer']
}

const hightlightState = object({
  code: string(''),
  language: string('text'),
  showLineNumbers: boolean(false),
})

export type HighlightPluginState = typeof hightlightState

export interface HighlightPluginConfig {
  Renderer: React.ComponentType<HighlightRendererProps>
}

export type HighlightProps = EditorPluginProps<
  HighlightPluginState,
  HighlightPluginConfig
>

export function createHighlightPlugin(
  config: HighlightConfig = {}
): EditorPlugin<HighlightPluginState, HighlightPluginConfig> {
  const { Renderer = HighlightRenderer } = config

  return {
    Component: HighlightEditor,
    state: hightlightState,
    config: { Renderer },
  }
}
