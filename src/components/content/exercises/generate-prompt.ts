export type ExerciseGenerationDifficulty = 'low' | 'medium' | 'high'

interface ExerciseParams {
  subject: string
  topic: string
  grade: string
  exerciseType: string
  numberOfSubtasks: number
  learningGoal: string
  difficulty: ExerciseGenerationDifficulty
  priorKnowledge: string
}

const difficultyToPromptTexts: Record<string, [string, string]> = {
  low: ['leicht', 'Die Schüler haben Schwierigkeiten, abstrakt zu denken'],
  medium: ['moderat', 'Die Schüler haben gute Vorkenntnisse'],
  high: ['schwer', 'Die Schüler können gut abstrakt denken'],
}

const exerciseTypeToPromptTexts: Record<
  string,
  { exerciseText: string; keyDescription: string }
> = {
  'multiple choice': {
    exerciseText: `vom Typ Multiple Choice, bei der es auch mehr als eine korrekte Antwort geben kann`,
    keyDescription: `type: "multiple_choice", question, options und correct_options. Der Key options soll als Value eine Liste von Antwortmöglichkeiten haben, der Key correct_options eine Liste mit den Indizes der korrekten Antworten`,
  },
  'single choice': {
    exerciseText: `vom Typ Single Choice, bei der aus verschiedenen Antwortmöglichkeiten genau 1 korrekte Antwort ausgewählt werden muss`,
    keyDescription: `type: "single_choice", question, options und correct_options. Der Key options soll als Value eine Liste von Antwortmöglichkeiten haben, der Key correct_options den Index der korrekten Antwort`,
  },
  'single word solution': {
    exerciseText: `, deren Lösung aus einem Wort besteht`,
    keyDescription: `type: 'short_answer', question und correct_answer`,
  },
  'single number solution': {
    exerciseText: `zur Berechnung, deren Lösung aus einer Zahl besteht`,
    keyDescription: `type: 'short_answer', question und correct_answer`,
  },
}

export const generateExercisePrompt = (params: ExerciseParams): string => {
  const {
    subject,
    topic,
    grade,
    exerciseType,
    numberOfSubtasks,
    learningGoal,
    difficulty,
    priorKnowledge,
  } = params

  const [difficultyText, difficultyDescription] =
    difficultyToPromptTexts[difficulty]
  const { exerciseText, keyDescription } =
    exerciseTypeToPromptTexts[exerciseType]

  const subtasks =
    numberOfSubtasks < 2
      ? ''
      : ` mit ${numberOfSubtasks} voneinander unabhängigen Teilaufgaben`

  return `Du bist eine kreative Lehrkraft, die spannende Aufgaben für Schüler des ${grade}. Jahrgangs im Fach ${subject} entwickelt. Erstelle zum Thema "${topic}" eine Aufgabe${subtasks} ${exerciseText}. Füge eine sinnvolle Überschrift hinzu, aus der das Thema der Aufgabe hervorgeht. Die Schüler haben folgendes Vorwissen: ${priorKnowledge}
Nach Bearbeiten der Aufgabe beherrschen die Schüler folgendes besser: ${learningGoal}
Verwende leichte Sprache. Das Anforderungsniveau soll ${difficultyText} sein. Beachte folgende Charakterisierung der Schüler: ${difficultyDescription}. Stelle die notierte Aufgabe zum Hochladen auf eine Lernplattform in einem unnamed JSON Objekt dar ${keyDescription}. Formatiere alle mathematischen Symbole in LateX.`
}
