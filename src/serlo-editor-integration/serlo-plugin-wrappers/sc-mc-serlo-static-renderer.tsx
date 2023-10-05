import { useRouter } from 'next/router'
import { useContext } from 'react'

import { isPrintMode } from '@/components/print-mode'
import { useAB } from '@/contexts/ab'
import { useInstanceData } from '@/contexts/instance-context'
import { RevisionViewContext } from '@/contexts/revision-view-context'
import { useEntityId, useRevisionId } from '@/contexts/uuids-context'
import {
  ExerciseSubmissionData,
  exerciseSubmission,
} from '@/helper/exercise-submission'
import { ScMcExerciseRendererAnswer } from '@/serlo-editor/plugins/sc-mc-exercise/renderer'
import { ScMcExerciseStaticRenderer } from '@/serlo-editor/plugins/sc-mc-exercise/static'
import { EditorScMcExercisePlugin } from '@/serlo-editor-integration/types/editor-plugins'

export function SerloScMcExerciseStaticRenderer(
  props: EditorScMcExercisePlugin
) {
  const { asPath } = useRouter()
  const ab = useAB()
  const entityId = useEntityId()
  const revisionId = useRevisionId()
  const isRevisionView = useContext(RevisionViewContext)

  const exStrings = useInstanceData().strings.content.exercises

  return (
    <ScMcExerciseStaticRenderer
      {...props}
      isPrintMode={isPrintMode}
      // TODO:
      // This might break for some cases where ID is not yet stored in db
      // The old version used node.positionOnPage, node.context.id, node.positionInGroup and path 😅
      // to generate a somewhat unique key
      idBase={`sc-mc-${props.id}`}
      onEvaluate={onEvaluate}
      renderExtraAnswerContent={renderRevisionExtra}
    />
  )

  function onEvaluate(correct: boolean, type: ExerciseSubmissionData['type']) {
    if (entityId && revisionId) {
      exerciseSubmission(
        {
          path: asPath,
          entityId,
          revisionId,
          result: correct ? 'correct' : 'wrong',
          type,
        },
        ab
      )
    }
  }

  function renderRevisionExtra(
    answer: ScMcExerciseRendererAnswer,
    hasFeedback?: boolean
  ) {
    if (!isRevisionView || !hasFeedback) return null
    return (
      <div className="serlo-revision-extra-info mb-4 rounded-xl bg-editor-primary-200 py-2">
        {answer.isCorrect && (
          <span className="mx-side text-sm font-bold">
            [{exStrings.correct}]
          </span>
        )}
        {answer.feedback}
      </div>
    )
  }
}
