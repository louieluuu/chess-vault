import React from 'react'

function Menu({ chess, orientation }) {
  async function isValidVariation() {
    // Empty variation
    if (chess.pgn() === '') {
      console.log('Empty variation')
      return false
    }

    // Duplicate variation
    const isDuplicate = await window.db.checkDuplicate(chess.pgn())
    console.log(`isDuplicate: ${isDuplicate}`)
    if (isDuplicate) {
      console.log('Duplicate variation')
      return false
    }

    console.log('Valid variation. Saving...')
    return true
  }

  function saveVariation() {
    if (!isValidVariation()) {
      return
    }

    const variation = {
      pgn: chess.pgn(),
      orientation: orientation
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
