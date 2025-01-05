import { useState, useEffect } from 'react'

import { GiOpenBook } from 'react-icons/gi'
import { IoIosSave } from 'react-icons/io'

import { pgnToMovesArray, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE } from '../utils/chess'
import { playSound, sounds } from '../utils/sound'

function Menu({ chess, orientation, setIsStudying, setVariations }) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatus('')
    }, 2500)

    return () => clearTimeout(timeout)
  }, [status])

  /********************
   * Helper functions *
   ********************/
  async function isValidVariation(variation) {
    // Empty variation
    if (variation.pgn === '') {
      setStatus('Empty variation.')
      playSound(sounds.incorrect)
      return false
    }

    // Variation is too short
    const pgnMoves = pgnToMovesArray(variation.pgn)
    if (variation.orientation === 'white') {
      if (pgnMoves.length < NUM_AUTO_MOVES_WHITE + 1) {
        setStatus('Variation is too short.')
        playSound(sounds.incorrect)
        return false
      }
    } else if (variation.orientation === 'black') {
      if (pgnMoves.length < NUM_AUTO_MOVES_BLACK + 1) {
        setStatus('Variation is too short.')
        playSound(sounds.incorrect)
        return false
      }
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(variation)
    if (isDuplicate) {
      setStatus('Duplicate variation.')
      playSound(sounds.incorrect)
      return false
    }

    setStatus('Variation saved!')
    return true
  }

  /********************
   *  Main functions  *
   ********************/
  async function saveVariation() {
    const variation = {
      pgn: chess.pgn(),
      orientation: orientation
    }

    const isValid = await isValidVariation(variation)
    if (!isValid) {
      return
    }

    window.db.save(variation)
    playSound(sounds.saveVariation)

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

  async function study() {
    const variations = await window.db.retrieve()
    console.log(`All variations: ${JSON.stringify(variations, null, 2)}`)
    if (variations.length === 0) {
      setStatus('0 variations retrieved!')
      return
    }
    setVariations(variations)
    setIsStudying(true)
  }

  return (
    <div className="menu">
      <div className="menu__status">{status}</div>

      <button className="menu__btn--save" onClick={saveVariation}>
        <IoIosSave className="menu__icon--save" />
        Save Variation
      </button>

      <button className="menu__btn--study" onClick={study}>
        <GiOpenBook className="menu__icon--study" />
        Study Variations
      </button>
    </div>
  )
}

export default Menu
