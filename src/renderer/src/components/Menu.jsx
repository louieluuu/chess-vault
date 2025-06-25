import { useState, useEffect } from 'react'

// Components
import MenuButton from './MenuButton'

// React icons
import { FaCirclePlay, FaCirclePause } from 'react-icons/fa6'
import { FaUnlockAlt } from 'react-icons/fa'

import { pgnToMovesArray, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE } from '../utils/chess'
import { playSound, sounds } from '../utils/sound'

const MESSAGE_TIMEOUT_MS = 3005

function Menu({
  chess,
  orientation,
  opening,
  eco,
  isStudying,
  setIsStudying,
  variations,
  setVariations
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
      eco: eco
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
      // db deletion done; update local variations array as well
      setVariations((prev) =>
        prev.filter((v) => !(v.pgn === result.pgn && v.orientation === result.orientation))
      )
      setMessage('[OVERWROTE] Variation saved!')
    } else {
      setMessage('Variation saved!')
    }

    window.db.save(variation)
    setVariations((prev) => [...prev, variation])

    playSound(sounds.saveVariation)
    showSaveAnimation()
  }

  async function study() {
    setVariations(await window.db.getVariations())
    console.log(`Study variations: ${JSON.stringify(variations, null, 2)}`)

    playSound(sounds.startStudy)
    setIsStudying(true)
  }

  function stopStudy() {
    setIsStudying(false)
  }

  return (
    <div className="menu">
      <div className="menu__message">{message}</div>
      <div className="menu__container--buttons">
        <MenuButton
          icon={<FaUnlockAlt />}
          label="Save Variation"
          onClick={saveVariation}
          isDisabled={isStudying}
        />
        {isStudying ? (
          <MenuButton
            icon={<FaCirclePause />}
            label={`Stop [${variations.length} due]`}
            onClick={stopStudy}
            isDisabled={variations.length === 0}
          />
        ) : (
          <MenuButton
            icon={<FaCirclePlay />}
            label={`Study [${variations.length} due]`}
            onClick={study}
            isDisabled={variations.length === 0}
          />
        )}
      </div>
    </div>
  )
}

export default Menu
