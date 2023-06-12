import {
  editorContent,
  entity,
  serializedChild,
  OptionalChild,
  entityType,
  headerInputClasses,
} from './common/common'
import { RevisionHistoryLoader } from './helpers/content-loaders/revision-history-loader'
import { Settings } from './helpers/settings'
import { ToolbarMain } from './toolbar-main/toolbar-main'
import { useLoggedInData } from '@/contexts/logged-in-data-context'
import { AddButton } from '@/serlo-editor/editor-ui'
import {
  EditorPlugin,
  EditorPluginProps,
  list,
  string,
} from '@/serlo-editor/plugin'

export const courseTypeState = entityType(
  {
    ...entity,
    title: string(),
    description: editorContent(),
    meta_description: string(),
  },
  {
    'course-page': list(serializedChild('type-course-page')),
  }
)

export const courseTypePlugin: EditorPlugin<typeof courseTypeState> = {
  Component: CourseTypeEditor,
  state: courseTypeState,
  config: {},
}

function CourseTypeEditor(props: EditorPluginProps<typeof courseTypeState>) {
  const { title, meta_description, 'course-page': children } = props.state
  const loggedInData = useLoggedInData()
  if (!loggedInData) return null
  const editorStrings = loggedInData.strings.editor

  return (
    <article>
      {props.renderIntoToolbar(
        <RevisionHistoryLoader
          id={props.state.id.value}
          currentRevision={props.state.revision.value}
          onSwitchRevision={props.state.replaceOwnState}
        />
      )}
      {props.renderIntoSettings(
        <Settings>
          <Settings.Textarea
            label={editorStrings.course.seoDesc}
            state={meta_description}
          />
        </Settings>
      )}
      <h1>
        {props.editable ? (
          <input
            className={headerInputClasses}
            placeholder={editorStrings.course.title}
            value={title.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              title.set(e.target.value)
            }}
          />
        ) : (
          <span itemProp="name">{title.value}</span>
        )}
      </h1>
      {children.map((child, index) => {
        return (
          <OptionalChild
            state={child}
            key={child.id}
            removeLabel={editorStrings.course.removeCoursePage}
            onRemove={() => {
              children.remove(index)
            }}
          />
        )
      })}
      <hr />
      <AddButton onClick={() => children.insert()}>
        {editorStrings.course.addCoursePage}
      </AddButton>
      <ToolbarMain showSubscriptionOptions {...props.state} />
    </article>
  )
}
