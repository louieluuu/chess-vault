import { useState } from 'react'
import { pgnToMovesArray, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE } from '../utils/chess'

function Menu({ chess, orientation, setIsStudying, setVariations }) {
  const [status, setStatus] = useState('')

  /********************
   * Helper functions *
   ********************/
  async function isValidVariation(variation) {
    // Empty variation
    if (variation.pgn === '') {
      setStatus('Empty variation')
      return false
    }

    // Variation is too short
    const pgnMoves = pgnToMovesArray(variation.pgn)
    if (variation.orientation === 'white') {
      if (pgnMoves.length < NUM_AUTO_MOVES_WHITE + 1) {
        setStatus('Variation is too short')
        return false
      }
    } else if (variation.orientation === 'black') {
      if (pgnMoves.length < NUM_AUTO_MOVES_BLACK + 1) {
        setStatus('Variation is too short')
        return false
      }
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(variation)
    if (isDuplicate) {
      setStatus('Duplicate variation')
      return false
    }

    setStatus('Valid variation. Saving...')
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

    // TODO Reset the board
    // chess.reset()
    // setFen(chess.fen())
    // setLastMove(null)
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

      <button className="menu__btn--submit" onClick={saveVariation}>
        Save Variation
      </button>

      <button className="menu__btn--study" onClick={study}>
        Study Variations
      </button>
    </div>
  )
}

export default Menu
