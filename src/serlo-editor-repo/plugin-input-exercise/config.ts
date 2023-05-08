import * as R from 'ramda'

import {
  InputExerciseConfig,
  InputExercisePluginConfig,
  InputExerciseType,
} from '.'
import { legacyEditorTheme } from '@/helper/colors'

export function useInputExerciseConfig(
  config: InputExerciseConfig
): InputExercisePluginConfig {
  const { i18n = {}, theme = {} } = config

  return {
    i18n: R.mergeDeepRight(
      {
        types: {
          [InputExerciseType.InputStringNormalizedMatchChallenge]: 'Text',
          [InputExerciseType.InputNumberExactMatchChallenge]: 'Number',
          [InputExerciseType.InputExpressionEqualMatchChallenge]:
            'Mathematical expression',
        },
        type: { label: 'Choose the exercise type' },
        unit: { label: 'Unit' },
        answer: {
          label: 'Answer',
          addLabel: 'Add answer',
          value: { placeholder: 'Enter the value' },
        },
        feedback: { label: 'Feedback' },
        inputPlaceholder: 'Your solution',
        fallbackFeedback: { correct: 'Correct', wrong: 'Wrong' },
      },
      i18n
    ),
    theme: {
      borderColor: legacyEditorTheme.primary.background,
      borderStyle: '3px solid',
      ...theme,
    },
  }
}
