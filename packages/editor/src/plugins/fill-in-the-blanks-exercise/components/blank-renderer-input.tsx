import { AutogrowInput } from '@editor/editor-ui/autogrow-input'
import { type ComponentProps, forwardRef } from 'react'

import { BlankId } from '..'
import { FillInTheBlanksContextType } from '../context/blank-context'
import { cn } from '@/helper/cn'

interface BlankRendererInputProps {
  blankId: string
  context: FillInTheBlanksContextType
  isAnswerCorrect?: boolean
}

export const BlankRendererInput = forwardRef<
  HTMLInputElement,
  BlankRendererInputProps & ComponentProps<'input'>
>(function BlankRendererInput(props, ref) {
  const { blankId, context, isAnswerCorrect, onChange, onKeyDown, onBlur } =
    props

  const text = context.textInBlanks.get(blankId)?.text ?? ''

  return (
    <AutogrowInput
      ref={ref}
      value={text}
      className={cn(
        'h-[25px]',
        isAnswerCorrect && 'border-green-500 focus:outline-green-500',
        isAnswerCorrect === false && 'border-red-400 focus:outline-red-400'
      )}
      data-qa="blank-input"
      onChange={(event) => {
        setTextUserTypedIntoBlank(event.target.value)
        onChange?.(event)
      }}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        setTextUserTypedIntoBlank(text.trim())
        onBlur?.(event)
      }}
    />
  )

  function setTextUserTypedIntoBlank(newText: string) {
    // Copy Map object
    const newTextUserTypedIntoBlankList = new Map<string, { text: string }>(
      context.textUserTypedIntoBlanks.value
    )

    // Set new text
    newTextUserTypedIntoBlankList.set(blankId, { text: newText })

    // Update state
    context.textUserTypedIntoBlanks.set(newTextUserTypedIntoBlankList)

    // Reset feedback state
    context.feedbackForBlanks.set(
      new Map<BlankId, { isCorrect: boolean | undefined }>()
    )
  }
})
