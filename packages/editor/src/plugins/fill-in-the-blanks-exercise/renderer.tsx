import * as t from 'io-ts'
import { type ReactNode, useMemo, useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import type { BlankId, DraggableId, FillInTheBlanksMode } from '.'
import { BlankCheckButton } from './components/blank-check-button'
import { DraggableSolution } from './components/blank-solution'
import { DraggableSolutionArea } from './components/blank-solution-area'
import { FillInTheBlanksContext } from './context/blank-context'
import { Blank } from '../text'

// TODO: Copy of type in /src/plugins/text/types/text-editor.ts
const Answer = t.type({
  answer: t.string,
})
const Blank = t.type({
  type: t.literal('textBlank'),
  children: t.unknown,
  blankId: t.string,
  correctAnswers: t.array(Answer),
})

type Blanks = t.TypeOf<typeof Blank>[]

interface FillInTheBlanksRendererProps {
  text: ReactNode
  textPluginState: {
    plugin: string
    state?: unknown
    id?: string | undefined
  }
  mode: FillInTheBlanksMode
  initialTextInBlank: 'empty' | 'correct-answer'
  isEditing?: boolean
}

export function FillInTheBlanksRenderer(props: FillInTheBlanksRendererProps) {
  const { text, textPluginState, mode, initialTextInBlank, isEditing } = props

  // Maps blankId to the learner feedback after clicking "Stimmts?" button
  // isCorrect === undefined -> no feedback
  const [feedbackForBlanks, setFeedbackForBlanks] = useState(
    new Map<BlankId, { isCorrect?: boolean }>()
  )

  /** Array of blank elements extracted from text editor state */
  const blanks: Blanks = useMemo(() => {
    return getBlanksWithinObject(textPluginState)
  }, [textPluginState])

  // Maps blankId to the text entered by the user. Modified when user types into a blank and causes rerender.
  const [textUserTypedIntoBlanks, setTextUserTypedIntoBlanks] = useState(
    new Map<BlankId, { text: string }>()
  )

  /** Maps blankId to the text that should be displayed in the blank.  */
  const textInBlanks = useMemo(() => {
    const newMap = new Map<BlankId, { text: string }>()
    blanks.forEach((blankState) => {
      const firstCorrectAnswer = blankState.correctAnswers.at(0)?.answer ?? ''
      newMap.set(blankState.blankId, {
        text: initialTextInBlank === 'correct-answer' ? firstCorrectAnswer : '',
      })
    })
    textUserTypedIntoBlanks.forEach((textUserTypedIntoBlank, blankId) =>
      newMap.set(blankId, { text: textUserTypedIntoBlank.text })
    )
    return newMap
  }, [blanks, textUserTypedIntoBlanks, initialTextInBlank])

  const draggables = useMemo(() => {
    return blanks.map(({ blankId, correctAnswers }) => ({
      draggableId: `solution-${blankId}`,
      text: correctAnswers[0].answer,
    }))
  }, [blanks])

  // Maps DraggableId to the BlankId where this draggable element is currently located
  const [locationOfDraggables, setLocationOfDraggables] = useState(
    new Map<DraggableId, BlankId>()
  )

  const handleDraggableAreaDrop = useCallback(
    (item: { draggableId: DraggableId }) => {
      const newMap = new Map<DraggableId, BlankId>(locationOfDraggables)
      newMap.delete(item.draggableId)
      setLocationOfDraggables(newMap)
    },
    [locationOfDraggables]
  )

  const shouldShowCheckButton = useMemo(() => {
    if (blanks.length < 1) return false
    if (mode === 'typing') {
      return [...textInBlanks.values()].every(({ text }) => text.length > 0)
    }
    return draggables.length === locationOfDraggables.size
  }, [
    blanks.length,
    draggables.length,
    locationOfDraggables.size,
    mode,
    textInBlanks,
  ])

  return (
    // Additional prop 'context={window}' prevents error with nested DndProvider components. See: https://github.com/react-dnd/react-dnd/issues/3257#issuecomment-1239254032
    <DndProvider backend={HTML5Backend} context={window}>
      <div className="mx-side mb-block leading-[30px] [&>p]:leading-[30px]">
        <FillInTheBlanksContext.Provider
          value={{
            mode,
            feedbackForBlanks,
            textInBlanks,
            textUserTypedIntoBlanks: {
              value: textUserTypedIntoBlanks,
              set: setTextUserTypedIntoBlanks,
            },
            draggables,
            locationOfDraggables: {
              value: locationOfDraggables,
              set: setLocationOfDraggables,
            },
          }}
        >
          {text}
        </FillInTheBlanksContext.Provider>

        {mode === 'drag-and-drop' ? (
          <DraggableSolutionArea onDrop={handleDraggableAreaDrop}>
            {draggables.map((draggable, index) =>
              locationOfDraggables.get(draggable.draggableId) ? null : (
                <DraggableSolution key={index} {...draggable} />
              )
            )}
          </DraggableSolutionArea>
        ) : null}

        {!isEditing ? (
          <BlankCheckButton
            isVisible={shouldShowCheckButton}
            feedback={feedbackForBlanks}
            onClick={checkAnswers}
          />
        ) : null}

        {/* Only debug output from here on */}
        <div className="hidden">
          Blanks state:
          {blanks.map((blank, index) => (
            <div key={index}>{JSON.stringify(blank)}</div>
          ))}
        </div>
        <div className="hidden">
          <div>State textUserTypedIntoBlank:</div>
          {[...textUserTypedIntoBlanks].map((entry, index) => {
            const blankId = entry[0]
            const text = entry[1].text
            return (
              <div
                className="ml-5"
                key={index}
              >{`Text: ${text} | BlankId: ${blankId}`}</div>
            )
          })}
        </div>
        <div className="hidden">
          {[...locationOfDraggables].map((entry, index) => (
            <div key={index}>
              {`DraggableId: ${entry[0]} in blankId: ${entry[1]}`}
            </div>
          ))}
        </div>
        <div className="hidden">
          {draggables.map((draggable, index) => (
            <div key={index}>
              {`DraggableId: ${draggable.draggableId} with text: ${draggable.text}`}
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  )

  function checkAnswers() {
    const newBlankAnswersCorrectList = new Map<
      BlankId,
      { isCorrect: boolean | undefined }
    >()

    blanks.forEach((blankState) => {
      const trimmedBlankText = getTrimmedBlankText(blankState.blankId)
      const isCorrect = blankState.correctAnswers.some(
        ({ answer }) => answer === trimmedBlankText
      )
      newBlankAnswersCorrectList.set(blankState.blankId, { isCorrect })
    })

    setFeedbackForBlanks(newBlankAnswersCorrectList)
  }

  function getTrimmedBlankText(blankId: string) {
    if (mode === 'typing') return textInBlanks.get(blankId)?.text.trim() ?? ''

    const draggableLocationInThisBlank = [...locationOfDraggables].find(
      ([, draggableBlankId]) => blankId === draggableBlankId
    )
    const draggableInThisBlank = draggables.find(
      ({ draggableId }) => draggableId === draggableLocationInThisBlank?.[0]
    )

    return draggableInThisBlank?.text.trim() ?? ''
  }
}

/** Searches for blank objects in text plugin state. They can be at varying depths. */
function getBlanksWithinObject(obj: object): Blanks {
  if (Blank.is(obj)) return [obj]

  // Recursively search this object's values for blank objects
  return Object.values(obj).reduce((blanks: Blanks, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      return [...blanks, ...getBlanksWithinObject(value)]
    }
    return blanks
  }, [])
}
