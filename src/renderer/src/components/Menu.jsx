import React from 'react'

function Menu({ chess, orientation }) {
  async function isValidVariation(variation) {
    // Empty variation
    if (chess.pgn() === '') {
      console.log('Empty variation')
      return false
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(variation)
    console.log(`isDuplicate: ${isDuplicate}`)
    if (isDuplicate) {
      console.log('Duplicate variation')
      return false
    }

    console.log('Valid variation. Saving...')
    return true
  }

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
    // setPgn(chess.pgn())
    // setLastMove(null)
  }

  return (
    <div className="menu">
      <button className="btn-submit" onClick={saveVariation}>
        Save Variation
      </button>
    </div>
  )
}

export default Menu
