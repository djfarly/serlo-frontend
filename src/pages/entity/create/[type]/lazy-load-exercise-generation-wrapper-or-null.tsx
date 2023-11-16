import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import { ExerciseGenerationWrapperProps } from '../../../../components/user-tools/exercise-generation-wrapper'
import { extractTopicFromTitle } from '@/components/content/exercises/exercise-generation-wizard/topic'
import { useAiFeatures } from '@/components/content/exercises/use-ai-features'

const ExerciseGenerationWrapper = dynamic<ExerciseGenerationWrapperProps>(() =>
  import('../../../../components/user-tools/exercise-generation-wrapper').then(
    (mod) => mod.ExerciseGenerationWrapper
  )
)

interface LazyLoadExerciseGenerationWrapperOrNullProps {
  subject: string
  taxonomyTitle: string
  setEditorState: ExerciseGenerationWrapperProps['setEditorState']
}

export function LazyLoadExerciseGenerationWrapperOrNull({
  subject,
  taxonomyTitle,
  setEditorState,
}: LazyLoadExerciseGenerationWrapperOrNullProps) {
  const router = useRouter()
  const { canUseAiFeatures } = useAiFeatures()
  const [showWizard, setShowWizard] = useState(false)
  const topic = extractTopicFromTitle(taxonomyTitle)

  console.log('LazyLoadExerciseGenerationWrapperOrNull: ', {
    router,
    canUseAiFeatures,
    showWizard,
  })

  useEffect(() => {
    if (router.query.showAiWizard === 'true' && canUseAiFeatures) {
      setShowWizard(true)
    } else {
      setShowWizard(false)
    }
  }, [showWizard, canUseAiFeatures, router.query])

  if (!showWizard) {
    return null
  }
  return (
    <ExerciseGenerationWrapper
      closeWizard={() => {
        setShowWizard(false)

        const url = new URL(window.location.href)
        // Delete any existing query params
        url.searchParams.delete('showAiWizard')
        url.searchParams.delete('topic')
        // Update URL without reloading the page
        router
          .replace(url.pathname + url.search, undefined, {
            shallow: true,
          })
          .then(() => void null)
          .catch(() => void null)
      }}
      subject={subject}
      topic={topic || ''}
      setEditorState={setEditorState}
    />
  )
}
