import styled from 'styled-components'

import { ScMcExerciseProps } from '.'
import { CheckElement } from '../../editor-ui'
import { colors } from '@/helper/colors'

export interface ChoiceRendererProps {
  children: React.ReactNode
  index: number
  onClick?: (event: React.MouseEvent<Element>) => void
  showFeedback?: boolean
  centered?: boolean
  selected?: boolean
}

export function ScMcExerciseChoiceRenderer({
  state,
  children,
  index,
  onClick,
  showFeedback,
  selected,
}: ScMcExerciseProps & ChoiceRendererProps) {
  return (
    <div className="flex">
      <CheckboxContainer>
        <CheckElement
          isRadio={state.isSingleChoice.value}
          isActive={selected || false}
          handleChange={onClick ? onClick : () => {}}
        />
      </CheckboxContainer>
      <Container
        isCorrect={state.answers[index].isCorrect.value}
        showFeedback={showFeedback || false}
      >
        {children}
      </Container>
    </div>
  )
}

const Container = styled.div<{ isCorrect: boolean; showFeedback: boolean }>(
  (props) => {
    return {
      paddingLeft: '20 px',
      color: props.showFeedback
        ? props.isCorrect
          ? colors.brandGreen
          : '#f7b07c'
        : 'black',
    }
  }
)

const CheckboxContainer = styled.div({
  textAlign: 'center',
  marginRight: '10px',
  marginBottom: '5px',
  fontWeight: 'bold',
})
