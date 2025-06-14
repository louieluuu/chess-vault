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
    const pgnArray = pgnToMovesArray(variation.pgn)

    // Empty variation
    if (pgnArray.length === 0) {
      setStatus('Empty variation.')
      return false
    }

    // Variation is too short
    if (
      (variation.orientation === 'white' && pgnArray.length < NUM_AUTO_MOVES_WHITE + 1) ||
      (variation.orientation === 'black' && pgnArray.length < NUM_AUTO_MOVES_BLACK + 1)
    ) {
      setStatus('Variation is too short.')
      return false
    }

    // Variation does not end on the player's move
    if (
      (variation.orientation === 'white' && pgnArray.length % 2 === 0) ||
      (variation.orientation === 'black' && pgnArray.length % 2 !== 0)
    ) {
      setStatus('Variation must end on your move.')
      return false
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(variation)
    if (isDuplicate) {
      setStatus('Duplicate variation.')
      return false
    }

    // _Your_ variation is redundant, ex:
    // db already has:    "1. e4 e5 2. c3 d5 3. d4"
    // You try to save:   "1. e4 e5 2. c3"
    const isRedundant = await window.db.checkRedundant(variation)
    if (isRedundant) {
      setStatus('Redundant variation.')
      return false
    }

    return true
  }

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

  async function showRepertoire() {
    setShowModal((prev) => !prev)
    const repertoire = await window.db.getRepertoire()
    console.log(`Repertoire: ${JSON.stringify(repertoire, null, 2)}`)
  }

  async function saveVariation() {
    // Disable Save button when studying
    if (isStudying) {
      return
    }

    const variation = {
      pgn: chess.pgn(),
      orientation: orientation
    }

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
      setStatus('[OVERWROTE] Variation saved!')
    } else {
      setStatus('Variation saved!')
    }

    window.db.save(variation)
    setVariations((prev) => [...prev, variation])

    showSaveAnimation()
    playSound(sounds.saveVariation)
  }

  async function study() {
    setVariations(await window.db.getVariations())
    console.log(`Study variations: ${JSON.stringify(variations, null, 2)}`)

    if (variations.length === 0) {
      setStatus("You're booked beyond belief!")
      return
    }

    playSound(sounds.startStudy)
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
      <span className={`menu__label${variations.length === 0 ? '--booked' : ''}`}>
        [
        <span className={`menu__label${variations.length === 0 ? '--booked' : '--count'}`}>
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
