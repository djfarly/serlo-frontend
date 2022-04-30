// eslint-disable-next-line import/no-internal-modules
import { faExternalLinkAlt, Icon } from '@edtr-io/ui'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { ArticleProps, buttonClass, OpenInNewTab } from '.'
import { InlineInput } from '../helpers/inline-input'
import { InlineSettings } from '../helpers/inline-settings'
import { InlineSettingsInput } from '../helpers/inline-settings-input'
import { SerloAddButton } from '../helpers/serlo-editor-button'
import { useLoggedInData } from '@/contexts/logged-in-data-context'

interface ArticleSourcesProps {
  sources: ArticleProps['state']['sources']
  editable: boolean
  isFocused: (arg1: string, arg2?: number) => boolean | null
  setFocusedInlineSetting: React.Dispatch<
    React.SetStateAction<{
      id: string
      index?: number | undefined
    } | null>
  >
}

export function ArticleSources({
  sources,
  editable,
  isFocused,
  setFocusedInlineSetting,
}: ArticleSourcesProps) {
  const loggedInData = useLoggedInData()
  if (!loggedInData) return null
  const articleStrings = loggedInData.strings.editor.article

  if (!editable) {
    if (sources.length === 0) return null

    return (
      <>
        <h2>{articleStrings.sources}</h2>
        <ul>
          {sources.map((source, index) => {
            return (
              <li key={index}>
                <a href={source.href.value}>{source.title.value}</a>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  return (
    <>
      <h2>{articleStrings.sources}</h2>
      <DragDropContext
        onDragEnd={(result) => {
          const { source, destination } = result
          if (!destination) return
          sources.move(source.index, destination.index)
        }}
      >
        <Droppable droppableId="default">
          {(provided) => {
            return (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="!ml-1"
              >
                {renderDraggables()}
                {provided.placeholder}
              </ul>
            )
          }}
        </Droppable>
      </DragDropContext>
      {editable ? (
        <SerloAddButton
          onClick={() => {
            sources.insert(sources.length)
          }}
          className="ml-4 mb-4"
        />
      ) : null}
    </>
  )

  function renderDraggables() {
    return sources.map((source, index) => {
      return (
        <Draggable key={index} draggableId={`${index}`} index={index}>
          {(provided) => {
            return (
              <li ref={provided.innerRef} {...provided.draggableProps}>
                <div
                  style={{
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      flexGrow: 1,
                    }}
                  >
                    <span>
                      {isFocused('source', index) ? (
                        <InlineSettings
                          onDelete={() => {
                            sources.remove(index)
                          }}
                          position="below"
                        >
                          <InlineSettingsInput
                            value={source.href.value}
                            placeholder={articleStrings.linkUrl}
                            onChange={(event) => {
                              source.href.set(event.target.value)
                            }}
                          />
                          <a
                            target="_blank"
                            href={source.href.value}
                            rel="noopener noreferrer"
                          >
                            <OpenInNewTab title={articleStrings.openInTab}>
                              <Icon icon={faExternalLinkAlt} />
                            </OpenInNewTab>
                          </a>
                        </InlineSettings>
                      ) : null}
                      <a>
                        <InlineInput
                          value={source.title.value}
                          onFocus={() => {
                            setFocusedInlineSetting({
                              id: 'source',
                              index,
                            })
                          }}
                          onChange={(value) => {
                            source.title.set(value)
                          }}
                          placeholder={articleStrings.linkTitle}
                        />
                      </a>
                    </span>
                  </div>
                  <div>
                    <button
                      title={articleStrings.dragLabel}
                      {...provided.dragHandleProps}
                      className={buttonClass}
                    >
                      <Icon icon={faGripVertical} />
                    </button>
                  </div>
                </div>
              </li>
            )
          }}
        </Draggable>
      )
    })
  }
}
