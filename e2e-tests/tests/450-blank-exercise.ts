import assert from 'assert'
import { popupWarningFix } from './helpers/popup-warning-fix'

Feature('Serlo Editor - Blank exercise')

Before(popupWarningFix)

// TODO ideally import from
// editor/src/types/editor-plugin-type.ts/EditorPluginType.FillInTheBlanksExercise
const FillInTheBlanksExercise = 'blanksExercise'

const initialTextPluginCount = 1

Scenario('Create and remove fill in the gap exercise', async ({ I }) => {
  I.amOnPage('/entity/create/Exercise/23869')

  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  I.click(`$add-exercise-${FillInTheBlanksExercise}`)
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

  // I.click('$plugin-text-leaf-element')
  // I.click('Schreibe einen Text und füge Lücken ein')
  I.click(locate('$plugin-text-editor').last())

  I.type('This is a test')

  I.click('$additional-toolbar-controls')
  I.click('$remove-plugin-button')
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
})

Scenario(
  'Create and remove fill in the gap exercise via undo',
  async ({ I }) => {
    I.amOnPage('/entity/create/Exercise/23869')

    I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
    I.click(`$add-exercise-${FillInTheBlanksExercise}`)
    I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

    I.pressKey(['CommandOrControl', 'Z'])

    I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  }
)

Scenario('Create and remove gaps through toolbar', async ({ I }) => {
  I.amOnPage('/entity/create/Exercise/23869')

  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  I.click(`$add-exercise-${FillInTheBlanksExercise}`)
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

  I.click(locate('$plugin-text-editor').last())
  I.type('This is a test with one gap')

  I.say('Select last word with keyboard and create gap')
  I.pressKey(['CommandOrControl', 'Shift', 'ArrowLeft'])

  I.seeElement('$plugin-toolbar-button-create-blank')
  I.dontSeeElement('$plugin-toolbar-button-remove-blank')
  I.click('$plugin-toolbar-button-create-blank')
  I.seeElement('$plugin-toolbar-button-remove-blank')
  I.dontSeeElement('$plugin-toolbar-button-create-blank')

  I.seeNumberOfElements('$blank-input', 1)
  I.click('$plugin-toolbar-button-remove-blank')
  I.dontSeeElement('$plugin-toolbar-button-remove-blank')
  I.dontSeeElement('$blank-input')
})

Scenario('Create a blank gap and type in it', async ({ I }) => {
  I.amOnPage('/entity/create/Exercise/23869')

  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  I.click(`$add-exercise-${FillInTheBlanksExercise}`)
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

  I.click(locate('$plugin-text-editor').last())
  I.say('Create an empty gap then type in it')

  I.type('No gap here ')
  I.click('$plugin-toolbar-button-create-blank')
  I.seeNumberOfElements('$blank-input', 1)
  const GapContent = 'gap content'
  I.type(GapContent)
  I.seeInField('$blank-input', GapContent)
})

Scenario('Create and delete gaps with backspace/del', async ({ I }) => {
  I.amOnPage('/entity/create/Exercise/23869')

  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  I.click(`$add-exercise-${FillInTheBlanksExercise}`)
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

  I.click(locate('$plugin-text-editor').last())
  I.type('No gap here ')

  I.say('Create a gap, then delete it with backspace')
  I.click('$plugin-toolbar-button-create-blank')
  I.seeNumberOfElements('$blank-input', 1)
  I.pressKey('Backspace')
  I.dontSeeElement('$blank-input')

  I.say('Create a gap, then delete it with del')
  I.click('$plugin-toolbar-button-create-blank')
  I.seeNumberOfElements('$blank-input', 1)
  I.pressKey('Delete')
  I.dontSeeElement('$blank-input')
})

// This one is failing currently. The focus gets placed to the left side of the
// gap.
Scenario('Adding a gap before any text gets focused', async ({ I }) => {
  I.amOnPage('/entity/create/Exercise/23869')

  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
  I.click(`$add-exercise-${FillInTheBlanksExercise}`)
  I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

  I.click(locate('$plugin-text-editor').last())

  // If we uncomment this, the test passes
  // I.type('Some text')

  I.click('$plugin-toolbar-button-create-blank')
  I.seeNumberOfElements('$blank-input', 1)
  const isBlankInputFocused = await I.executeScript(() => {
    const blankInput = document.querySelector("[data-qa='blank-input']")
    return document.activeElement === blankInput
  })

  assert.strictEqual(
    isBlankInputFocused,
    true,
    'The blank input element is not focused'
  )
})

Scenario(
  'Create a few gaps, go to preview mode and solve them!',
  async ({ I }) => {
    I.amOnPage('/entity/create/Exercise/23869')

    I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount)
    I.click(`$add-exercise-${FillInTheBlanksExercise}`)
    I.seeNumberOfElements('$plugin-text-editor', initialTextPluginCount + 1)

    I.click(locate('$plugin-text-editor').last())
    I.type('No gap here ')

    I.say('Create two gaps')
    I.click('$plugin-toolbar-button-create-blank')
    I.seeNumberOfElements('$blank-input', 1)
    I.type('first')

    // unfocus gap
    I.pressKey('ArrowRight')
    // add non gapped text with surrounding space
    I.type(' and ')

    I.click('$plugin-toolbar-button-create-blank')
    I.type('second')
    I.seeNumberOfElements('$blank-input', 2)

    I.say('Change mode to preview and solve them incorrectly')
    I.click('$plugin-blanks-exercise-preview-button')
    I.seeNumberOfElements('$blank-input', 2)
    I.click(locate('$blank-input').first())
    // Adding the second gap solution to the first gap
    I.type('second')

    // The button to check answers should only be visible once all gaps have
    // inputs
    I.dontSeeElement('$plugin-exercise-check-answer-button')

    I.click(locate('$blank-input').last())
    // Adding the first gap solution to the second gap
    I.type('first')
    I.seeElement('$plugin-exercise-check-answer-button')
    I.click('$plugin-exercise-check-answer-button')
    I.seeElement('$plugin-exercise-feedback-incorrect')

    I.say('We now edit the gaps and solve them correctly')
    // Double click to highlight and overwrite the existing input
    I.doubleClick(locate('$blank-input').first())
    I.type('first')

    // Double click to highlight and overwrite the existing input
    I.doubleClick(locate('$blank-input').last())
    I.type('second')

    I.click('$plugin-exercise-check-answer-button')
    I.seeElement('$plugin-exercise-feedback-correct')
  }
)

Scenario.todo('Tests for drag & drop mode')
