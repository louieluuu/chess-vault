import { useState, useEffect } from 'react'

import { FaBook } from 'react-icons/fa'
import { FaCirclePlay } from 'react-icons/fa6'
import { GiOpenBook } from 'react-icons/gi'
import { IoIosSave } from 'react-icons/io'

import { pgnToMovesArray, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE } from '../utils/chess'
import { playSound, sounds } from '../utils/sound'

function Menu({ chess, orientation, isStudying, setIsStudying, setVariations, variations }) {
  const [status, setStatus] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatus('')
    }, 2500)

    return () => clearTimeout(timeout)
  }, [status])

  /********************
   * Helper functions *
   ********************/
  function showRepertoireIcon() {
    return showModal ? <GiOpenBook /> : <FaBook />
  }

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
  async function showRepertoire() {
    setShowModal((prev) => !prev)
    const repertoire = await window.db.getRepertoire()
    console.log(`Repertoire: ${JSON.stringify(repertoire, null, 2)}`)
  }

  async function saveVariation() {
    if (isStudying) {
      return
    }

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
    console.log(`Study variations: ${JSON.stringify(variations, null, 2)}`)
    if (variations.length === 0) {
      setStatus("You're booked beyond belief!")
      return
    }
    setIsStudying(true)
  }

  return (
    <div className="menu">
      <button className="menu__icon--repertoire" onClick={showRepertoire}>
        {showRepertoireIcon()}
      </button>

      <div className="menu__status">{status}</div>

      <button
        className={`menu__btn--save${isStudying ? '--disabled' : ''}`}
        onClick={saveVariation}
      >
        <IoIosSave className={`menu__icon--save${isStudying ? '--disabled' : ''}`} />
        Save Variation
      </button>
      <span className={`menu__label${variations.length === 0 ? '--disabled' : ''}`}>
        [
        <span className={`menu__label${variations.length === 0 ? '--disabled' : '--count'}`}>
          {variations.length}
        </span>
        &nbsp;remaining]
      </span>
      <button
        className={`menu__btn--study${variations.length === 0 ? '--disabled' : ''}`}
        onClick={study}
      >
        <FaCirclePlay className="menu__icon--study" />
        Study Variations
      </button>
    </div>
  )
}

export default Menu
