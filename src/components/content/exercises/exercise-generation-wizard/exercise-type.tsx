import { useRouter } from 'next/router'
import { useRef, useEffect } from 'react'

import { WizardPageProps } from './wizard-page-props'
import { MenuButton, MenuItem } from '../menu-button'
import { useLoggedInData } from '@/contexts/logged-in-data-context'
import { replacePlaceholders } from '@/helper/replace-placeholders'

interface ExerciseTypeProps extends WizardPageProps {
  exerciseType: string | null
  setExerciseType: (type: string | null) => void
  numberOfSubtasks: number
  setNumberOfSubtasks: (num: number) => void
}

export function ExerciseType({
  exerciseType,
  setExerciseType,
  numberOfSubtasks,
  setNumberOfSubtasks,
  onNext,
  isSummary,
}: ExerciseTypeProps) {
  const exerciseTypeStrings =
    useLoggedInData()!.strings.ai.exerciseGeneration.exerciseType

  const router = useRouter()

  const isExerciseGroup = router.asPath
    .toLowerCase()
    .includes('/exercisegroup/')

  const focusRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isExerciseGroup) {
      setNumberOfSubtasks(0)
      return
    }
    if (focusRef.current) focusRef.current.focus()
  }, [isExerciseGroup, setNumberOfSubtasks])

  return (
    <div className="flex flex-col">
      {!isSummary ? (
        <p className="mb-4 text-xl">
          {replacePlaceholders(exerciseTypeStrings.title, {
            exerciseType: <b>{exerciseTypeStrings.exerciseType}</b>,
          })}
        </p>
      ) : null}

      <div className="flex items-center">
        <label
          htmlFor="exerciseTypeDropdown"
          className="mr-2 font-semibold text-brand-700"
        >
          {exerciseTypeStrings.label}
        </label>
        <MenuButton
          value={exerciseType || ''}
          onChange={(newValue) => setExerciseType(newValue)}
          defaultValue=""
        >
          <MenuItem value="">{exerciseTypeStrings.chooseOption}</MenuItem>
          <MenuItem value="single choice">
            {exerciseTypeStrings.singleChoice}
          </MenuItem>
          <MenuItem value="multiple choice">
            {exerciseTypeStrings.multipleChoice}
          </MenuItem>
          <MenuItem value="single number solution">
            {exerciseTypeStrings.inputExercise}
          </MenuItem>
        </MenuButton>
      </div>

      {isExerciseGroup ? (
        <>
          <p className="mb-4 mt-7 text-lg text-brand-700">
            {isSummary ? (
              <span className="text-base font-semibold">
                {exerciseTypeStrings.subtasksTitleSummary}
              </span>
            ) : (
              <span>{exerciseTypeStrings.subtasksTitleExerciseGroup}</span>
            )}
          </p>

          <div className="mt-2 flex items-center">
            <input
              type="number"
              min={2}
              max={10}
              value={numberOfSubtasks}
              onChange={(e) => {
                setNumberOfSubtasks(Number(e.target.value))
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNext()
                }
              }}
              className="ml-2 rounded-md border border-sky-200 p-2 pl-2 focus:border-sky-200 focus:outline-brand-700"
              placeholder={exerciseTypeStrings.numberOfSubtasksPlaceholder}
              ref={focusRef}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
