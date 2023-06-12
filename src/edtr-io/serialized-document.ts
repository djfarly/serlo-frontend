import { ArticlePluginState } from './plugins/article'
import { DeprecatedPluginState } from './plugins/deprecated'
import { EquationsPluginState } from './plugins/equations'
import { ErrorPluginState } from './plugins/error'
import { ExercisePluginState } from './plugins/exercise'
import { ImportantPluginState } from './plugins/important'
import { InjectionPluginState } from './plugins/injection'
import { LayoutPluginState } from './plugins/layout'
import { SeparatorPluginState } from './plugins/separator'
import { SolutionPluginState } from './plugins/solution'
import type { StateTypeSerializedType } from '@/serlo-editor/plugin'
import { AnchorPluginState } from '@/serlo-editor/plugins/anchor'
import { BlockquotePluginState } from '@/serlo-editor/plugins/blockquote'
import { GeogebraPluginState } from '@/serlo-editor/plugins/geogebra'
import { HighlightPluginState } from '@/serlo-editor/plugins/highlight'
import { ImagePluginState } from '@/serlo-editor/plugins/image'
import { InputExercisePluginState } from '@/serlo-editor/plugins/input-exercise'
import { MultimediaExplanationPluginState } from '@/serlo-editor/plugins/multimedia-explanation'
import { RowsPluginState } from '@/serlo-editor/plugins/rows'
import { ScMcExercisePluginState } from '@/serlo-editor/plugins/sc-mc-exercise'
import { SpoilerPluginState } from '@/serlo-editor/plugins/spoiler'
import { TablePluginState } from '@/serlo-editor/plugins/table'
import { TextEditorState } from '@/serlo-editor/plugins/text'
import { VideoPluginState } from '@/serlo-editor/plugins/video'

export type SerializedDocument =
  | {
      plugin: 'anchor'
      state: StateTypeSerializedType<AnchorPluginState>
    }
  | {
      plugin: 'article'
      state: StateTypeSerializedType<ArticlePluginState>
    }
  | {
      plugin: 'blockquote'
      state: StateTypeSerializedType<BlockquotePluginState>
    }
  | {
      plugin: 'deprecated'
      state: StateTypeSerializedType<DeprecatedPluginState>
    }
  | {
      plugin: 'error'
      state: StateTypeSerializedType<ErrorPluginState>
    }
  | {
      plugin: 'equations'
      state: StateTypeSerializedType<EquationsPluginState>
    }
  | {
      plugin: 'exercise'
      state: StateTypeSerializedType<ExercisePluginState>
    }
  | {
      plugin: 'geogebra'
      state: StateTypeSerializedType<GeogebraPluginState>
    }
  | {
      plugin: 'highlight'
      state: StateTypeSerializedType<HighlightPluginState>
    }
  | {
      plugin: 'image'
      state: StateTypeSerializedType<ImagePluginState>
    }
  | {
      plugin: 'important'
      state: StateTypeSerializedType<ImportantPluginState>
    }
  | {
      plugin: 'injection'
      state: StateTypeSerializedType<InjectionPluginState>
    }
  | {
      plugin: 'inputExercise'
      state: StateTypeSerializedType<InputExercisePluginState>
    }
  | {
      plugin: 'layout'
      state: StateTypeSerializedType<LayoutPluginState>
    }
  | {
      plugin: 'multimedia'
      state: StateTypeSerializedType<MultimediaExplanationPluginState>
    }
  | {
      plugin: 'rows'
      state: StateTypeSerializedType<RowsPluginState>
    }
  | {
      plugin: 'scMcExercise'
      state: StateTypeSerializedType<ScMcExercisePluginState>
    }
  | {
      plugin: 'separator'
      state: StateTypeSerializedType<SeparatorPluginState>
    }
  | {
      plugin: 'spoiler'
      state: StateTypeSerializedType<SpoilerPluginState>
    }
  | {
      plugin: 'solution'
      state: StateTypeSerializedType<SolutionPluginState>
    }
  | {
      plugin: 'table'
      state: StateTypeSerializedType<TablePluginState>
    }
  | {
      plugin: 'text'
      state: StateTypeSerializedType<TextEditorState>
    }
  | {
      plugin: 'video'
      state: StateTypeSerializedType<VideoPluginState>
    }
