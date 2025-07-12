import { useState, useEffect } from 'react'

// Components
import MenuButton from './MenuButton'

// React icons
import { IoIosSave } from 'react-icons/io'
import { HiPauseCircle, HiPlayCircle } from 'react-icons/hi2'

import { pgnToMovesArray, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE } from '../utils/chess'
import { playSound, sounds } from '../utils/sound'

const MESSAGE_TIMEOUT_MS = 3005

function Menu({
  chess,
  orientation,
  opening,
  eco,
  setIsGrading,
  isStudying,
  setIsStudying,
  homework,
  setHomework,
  setVault
}) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessage('')
    }, MESSAGE_TIMEOUT_MS)

    return () => clearTimeout(timeout)
  }, [message])

  /********************
   * Helper functions *
   ********************/

  async function isValidVariation(variation) {
    const pgnArray = pgnToMovesArray(variation.pgn)

    // Empty variation
    if (pgnArray.length === 0) {
      setMessage('Empty variation.')
      return false
    }

    // Variation is too short
    if (
      (variation.orientation === 'white' && pgnArray.length < NUM_AUTO_MOVES_WHITE + 1) ||
      (variation.orientation === 'black' && pgnArray.length < NUM_AUTO_MOVES_BLACK + 1)
    ) {
      setMessage('Variation is too short.')
      return false
    }

    // Variation does not end on the player's move
    if (
      (variation.orientation === 'white' && pgnArray.length % 2 === 0) ||
      (variation.orientation === 'black' && pgnArray.length % 2 !== 0)
    ) {
      setMessage('Variation must end on your move.')
      return false
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(variation)
    if (isDuplicate) {
      setMessage('Duplicate variation.')
      return false
    }

    // _Your_ variation is redundant, ex:
    // db already has:    "1. e4 e5 2. c3 d5 3. d4"
    // You try to save:   "1. e4 e5 2. c3"
    const isRedundant = await window.db.checkRedundant(variation)
    if (isRedundant) {
      setMessage('Redundant variation.')
      return false
    }

    return true
  }

  // TODO: currently not applying; going to redo anyways dw
  function showSaveAnimation() {
    // Shine effect
    const saveButton = document.querySelector('.menu__btn--save')
    const saveIcon = document.querySelector('.menu__icon--save')
    saveButton.classList.add('shine')
    saveIcon.classList.add('shine')
    setTimeout(() => {
      saveButton.classList.remove('shine')
      saveIcon.classList.remove('shine')
    }, 750)
  }

  /********************
   *  Main functions  *
   ********************/

  async function saveVariation() {
    const variation = {
      pgn: chess.pgn(),
      fen: chess.fen(),
      orientation: orientation,
      opening: opening,
      eco: eco,
      active: 1
    }

    console.log(`${JSON.stringify(variation)}`)

    const isValid = await isValidVariation(variation)
    if (!isValid) {
      playSound(sounds.incorrect)
      return
    }

    // _Older_ variation is redundant and should be overwritten, ex:
    // You are saving:  "1. e4 e5 2. c3 d5 3. d4"
    // db has:          "1. e4 e5 2. c3"
    const result = await window.db.deleteRedundantVariation(variation)
    if (result) {
      // db deletion done; update local homework array as well
      setHomework((prev) =>
        prev.filter((v) => !(v.pgn === result.pgn && v.orientation === result.orientation))
      )
      setMessage('[OVERWROTE] Variation saved!')
    } else {
      setMessage('Variation saved!')
    }

    await window.db.save(variation)
    setHomework(await window.db.getHomework())
    setVault(await window.db.getVault())

    playSound(sounds.saveVariation)
    showSaveAnimation()
  }

  async function study() {
    setHomework(await window.db.getHomework())
    console.log(`Study homework: ${JSON.stringify(homework, null, 2)}`)

    playSound(sounds.startStudy)
    setIsStudying(true)
  }

  function stopStudy() {
    setIsStudying(false)
    setIsGrading(false)
  }

  return (
    <div className="menu">
      <div className={`menu__message${!message ? 'menu__message--hidden' : ''}`}>{message}</div>
      <div className="menu__buttons">
        <MenuButton
          icon={<IoIosSave />}
          label="Save Variation"
          onClick={saveVariation}
          isDisabled={isStudying}
        />
        {isStudying ? (
          <MenuButton
            icon={<HiPauseCircle />}
            label={`Stop\n[${homework.length} due]`}
            onClick={stopStudy}
            isDisabled={homework.length === 0}
          />
        ) : (
          <MenuButton
            icon={<HiPlayCircle />}
            label={`Study\n[${homework.length} due]`}
            onClick={study}
            isDisabled={homework.length === 0}
          />
        )}
      </div>
    </div>
  )
}

export default Menu
