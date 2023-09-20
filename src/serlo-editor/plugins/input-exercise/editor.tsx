import { useRef, useState } from 'react'

import type { InputExerciseProps } from '.'
import { InputExerciseRenderer } from './renderer'
import { InputExerciseToolbar } from './toolbar'
import {
  AddButton,
  InteractiveAnswer,
  PreviewOverlaySimple,
} from '../../editor-ui'
import {
  focus,
  selectFocused,
  selectIsDocumentEmpty,
  store,
  useAppDispatch,
  useAppSelector,
} from '../../store'
import { useEditorStrings } from '@/contexts/logged-in-data-context'

export function InputExerciseEditor(props: InputExerciseProps) {
  const { editable, state, id } = props
  const inputExStrings = useEditorStrings().templatePlugins.inputExercise

  const focusedElement = useAppSelector(selectFocused)

  const dispatch = useAppDispatch()

  const [previewActive, setPreviewActive] = useState(false)
  const newestAnswerRef = useRef<HTMLInputElement>(null)

  const renderer = (
    <InputExerciseRenderer
      type={state.type.value}
      unit={state.unit.value}
      answers={state.answers.map(({ isCorrect, value, feedback }) => {
        const isEmptyFeedback = selectIsDocumentEmpty(
          store.getState(),
          feedback.id
        )
        return {
          isCorrect: isCorrect.value,
          value: value.value,
          feedback: isEmptyFeedback ? null : feedback.render(),
        }
      })}
    />
  )

  if (!editable) return renderer

  return (
    <div className="mb-12 mt-24 pt-4">
      <InputExerciseToolbar
        {...props}
        previewActive={previewActive}
        setPreviewActive={setPreviewActive}
      />
      <PreviewOverlaySimple active={previewActive}>
        {renderer}
      </PreviewOverlaySimple>
      {!previewActive && (
        <>
          {state.answers.map((answer, index: number) => {
            const isLast = index === state.answers.length - 1
            return (
              <InteractiveAnswer
                key={answer.feedback.id}
                answer={
                  <input
                    ref={isLast ? newestAnswerRef : undefined}
                    className="width-full ml-side border-none outline-none"
                    value={answer.value.value}
                    placeholder={inputExStrings.enterTheValue}
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      answer.value.set(e.target.value)
                    }}
                  />
                }
                feedback={answer.feedback.render()}
                feedbackID={answer.feedback.id}
                isActive={answer.isCorrect.value}
                handleChange={() =>
                  answer.isCorrect.set(!answer.isCorrect.value)
                }
                remove={() => state.answers.remove(index)}
                focusedElement={focusedElement || undefined}
              />
            )
          })}
          <AddButton
            onClick={() => {
              state.answers.insert()
              setTimeout(() => {
                dispatch(focus(id))
                newestAnswerRef.current?.focus()
              }, 10)
            }}
          >
            {inputExStrings.addAnswer}
          </AddButton>
        </>
      )}
    </div>
  )
}
