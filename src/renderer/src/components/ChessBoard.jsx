// Chessground styles
import 'react-chessground/dist/styles/chessground.css'

import React, { useState, useEffect } from 'react'
import Chessground from 'react-chessground'
import { SQUARES } from 'chess.js'

const DIMENSION = '45vw'

function ChessBoard({ chess, orientation, setOrientation }) {
  const [fen, setFen] = useState('')
  const [lastMove, setLastMove] = useState()
  const [pendingMove, setPendingMove] = useState()
  const [turnColor, setTurnColor] = useState('white')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'f' || e.key === 'F') {
        flipBoard()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function flipBoard() {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))
  }

  function onMove(from, to) {
    const moves = chess.moves({ verbose: true })
    for (let i = 0, len = moves.length; i < len; i++) {
      /* eslint-disable-line */
      if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
        setPendingMove([from, to])
        setSelectVisible(true)
        return
      }
    }
    if (chess.move({ from, to, promotion: 'x' }, { strict: true })) {
      setFen(chess.fen())
      setLastMove([from, to])
      setTurnColor(chess.turn() === 'w' ? 'white' : 'black')

      console.log(`Current fen: ${chess.fen()}`)
      console.log(`Current pgn: ${chess.pgn()}`)
      console.log(`Current date: ${new Date().toLocaleString()}`)
    }
  }

  function calcMovable() {
    const dests = new Map()
    SQUARES.forEach((s) => {
      const ms = chess.moves({ square: s, verbose: true })
      if (ms.length)
        dests.set(
          s,
          ms.map((m) => m.to)
        )
    })
    return {
      color: turnColor,
      dests,
      free: false
    }
  }

  return (
    <Chessground
      width={DIMENSION}
      height={DIMENSION}
      fen={fen}
      lastMove={lastMove}
      orientation={orientation}
      turnColor={turnColor}
      movable={calcMovable()}
      onMove={onMove}
    />
  )
}

export default ChessBoard
