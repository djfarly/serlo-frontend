import * as t from 'io-ts'

// export const InputScMcDecoder = t.strict({
//   type: t.keyof({
//     multiple_choice: null,
//     single_choice: null,
//   }),
//   question: t.string,
//   options: t.array(t.string),
//   correct_options: t.array(t.number),
// })

export const InputSingleChoiceDecoder = t.strict({
  heading: t.string,
  type: t.literal('single_choice'),
  question: t.string,
  options: t.array(t.string),
  correct_option: t.number,
  steps: t.array(t.string),
  // TODO strategy
})

export type ExpectedSingleChoiceType = t.TypeOf<typeof InputSingleChoiceDecoder>

export const humanReadableSingleChoiceExample: ExpectedSingleChoiceType = {
  heading: 'Exercise heading',
  steps: ['First of possibly many steps'],
  type: 'single_choice',
  question: 'Question of the exercise',
  options: ['The first of a few options', 'The second option'],
  correct_option: 0,
}

export const InputMultipleChoiceDecoder = t.strict({
  heading: t.string,
  type: t.literal('multiple_choice'),
  question: t.string,
  options: t.array(t.string),
  correct_options: t.array(t.number),
  steps: t.array(t.string),
})

export type ExpectedMultipleChoiceType = t.TypeOf<
  typeof InputMultipleChoiceDecoder
>

export const humanReadableMultipleChoiceExample: ExpectedMultipleChoiceType = {
  heading: 'Exercise heading',
  steps: ['First of possibly many steps'],
  type: 'multiple_choice',
  question: 'Question of the exercise',
  options: ['The first of a few options', 'The second option', 'Wrong option'],
  correct_options: [0, 1],
}

export const InputShortAnswerDecoder = t.strict({
  heading: t.string,
  type: t.literal('short_answer'),
  question: t.string,
  correct_answer: t.string,
  steps: t.array(t.string),
})

export type ExpectedShortAnswerType = t.TypeOf<typeof InputShortAnswerDecoder>

export const humanReadableShortAnswerExample: ExpectedShortAnswerType = {
  heading: 'Exercise heading',
  steps: ['First of possibly many steps'],
  type: 'short_answer',
  question: 'Question of the exercise',
  correct_answer: 'One correct answer',
}

/**
 * All possible exercise types that can be generated by the AI
 */
export type ExpectedExerciseTypes =
  | ExpectedSingleChoiceType
  | ExpectedMultipleChoiceType
  | ExpectedShortAnswerType

export const InputDecoder = t.strict({
  heading: t.string,
  subtasks: t.array(
    t.union([
      InputSingleChoiceDecoder,
      InputMultipleChoiceDecoder,
      InputShortAnswerDecoder,
    ])
  ),
})
