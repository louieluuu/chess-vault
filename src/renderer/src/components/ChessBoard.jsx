// TODO check purpose of lastMove and pendingMove

// Chessground styles
import 'react-chessground/dist/styles/chessground.css'

import GradeMenu from './GradeMenu'

import { FaCircleCheck } from 'react-icons/fa6'
import { FaCircleXmark } from 'react-icons/fa6'
import { GiOpenBook } from 'react-icons/gi'

import React, { useState, useEffect } from 'react'
import Chessground from 'react-chessground'
import { SQUARES } from 'chess.js'

import { Card, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE, pgnToMovesArray } from '../utils/chess'

const DIMENSION = '50dvh'

function ChessBoard({ chess, orientation, setOrientation, variations, isStudying, setIsStudying }) {
  const [fen, setFen] = useState('')
  const [pgn, setPgn] = useState('')
  const [lastMove, setLastMove] = useState([])
  const [pendingMove, setPendingMove] = useState()
  const [turnColor, setTurnColor] = useState('white')
  const [currVariation, setCurrVariation] = useState(0)
  const [currCorrectMove, setCurrCorrectMove] = useState(0)

  const [result, setResult] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [options, setOptions] = useState([])

  useEffect(() => {
    setTimeout(() => {
      setResult('')
    }, 1000)
  }, [result])

  // Flips the orientation of the board
  function flipBoard() {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))
  }

  useEffect(() => {
    function handleKeyDown(e) {
      // Disable keyboard shortcuts when studying
      if (isStudying) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          flipBoard()
          break
        case 'r':
          resetBoard()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isStudying, lastMove])

  // Resets the board to its initial state
  function resetBoard() {
    chess.reset()
    setFen(chess.fen())
    setLastMove(null)
    setTurnColor('white')
  }

  // Returns the opposite color of the current turn
  function oppositeColor() {
    return chess.turn() === 'w' ? 'white' : 'black'
  }

  // Auto-move the first couple of moves so the player knows which variation is pulled up
  function autoMove(pgnMoves, orientation) {
    const numAutoMoves = orientation === 'white' ? NUM_AUTO_MOVES_WHITE : NUM_AUTO_MOVES_BLACK
    for (let i = 0; i < numAutoMoves; ++i) {
      setTimeout(() => {
        const move = chess.move(pgnMoves[i])
        setLastMove([move.from, move.to])
        setFen(chess.fen())
        setTurnColor(oppositeColor())
        setCurrCorrectMove((prev) => prev + 1)
      }, i * 500)
    }
  }

  // Reset the board and set the PGN to the current variation
  useEffect(() => {
    resetBoard()
    if (variations.length === 0) {
      return
    }
    if (!isStudying) {
      return
    }
    // All variations finished
    if (currVariation >= variations.length) {
      setResult('booked')
      console.log("You're all booked up!")
      setIsStudying(false)
      return
    }

    const { pgn, orientation } = variations[currVariation]
    const pgnMoves = pgnToMovesArray(pgn)
    setOrientation(orientation)
    setPgn(pgnMoves)
    autoMove(pgnMoves, orientation)
  }, [isStudying, currVariation])

  function isCorrectMove(moveAttempt) {
    console.log(`moveAttempt: ${moveAttempt}, correct move: ${pgn[currCorrectMove]}`)
    return moveAttempt === pgn[currCorrectMove]
  }

  function undoMove(to, from) {
    chess.undo()
    setLastMove([to, from])
    setFen(chess.fen())
  }

  function showResult(result) {
    const className = `chessboard__result--${result}`
    switch (result) {
      case 'correct':
        return <FaCircleCheck className={className} />
      case 'incorrect':
        return <FaCircleXmark className={className} />
      case 'booked':
        return <GiOpenBook className={className} />
      default:
        return null
    }
  }

  function onMove(from, to) {
    const legalMoves = chess.moves({ verbose: true })
    for (let i = 0, len = legalMoves.length; i < len; i++) {
      /* eslint-disable-line */
      if (legalMoves[i].flags.indexOf('p') !== -1 && legalMoves[i].from === from) {
        setPendingMove([from, to])
        setSelectVisible(true)
        return
      }
    }
    // When studying, moves require an extra validation against the current variation
    if (isStudying) {
      const moveAttempt = chess.move({ from, to, promotion: 'x' }, { strict: true })

      // Incorrect
      if (!isCorrectMove(moveAttempt.san)) {
        setTimeout(() => {
          undoMove(to, from)
          setResult('incorrect')
        }, 500)
        return
      }

      // Correct
      const nextCurrCorrectMove = currCorrectMove + 1

      // If current variation is finished...
      if (nextCurrCorrectMove >= pgn.length) {
        const curr = variations[currVariation]

        const options = new Card(
          curr.status,
          curr.interval,
          curr.ease,
          curr.step
        ).calculateOptions()

        setOptions(options)
        setIsGrading(true)

        setResult('correct')
        setCurrCorrectMove(0) // TODO this should probably belong with setCurrVariation in Grade.jsx

        return
      }

      // Current variation is ongoing
      chess.move(pgn[nextCurrCorrectMove])
      setFen(chess.fen())
      setLastMove([from, to])
      setTurnColor(oppositeColor())
      setCurrCorrectMove(nextCurrCorrectMove + 1) // TODO will bug out if ends on the wrong side
    }
    // When not studying, any legal moves are passable
    else {
      if (chess.move({ from, to, promotion: 'x' }, { strict: true })) {
        setFen(chess.fen())
        setLastMove([from, to])
        setTurnColor(oppositeColor())
      }
    }
  }

  function calcMovable() {
    const dests = new Map()
    SQUARES.forEach((s) => {
      const legalMoves = chess.moves({ square: s, verbose: true })
      if (legalMoves.length)
        dests.set(
          s,
          legalMoves.map((m) => m.to)
        )
    })
    return {
      color: turnColor,
      dests,
      free: false
    }
  }

  return (
    <div className="chessboard">
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
      <div className="chessboard__result">{showResult(result)}</div>
      {isGrading && (
        <GradeMenu
          options={options}
          variations={variations}
          currVariation={currVariation}
          setCurrVariation={setCurrVariation}
          setIsGrading={setIsGrading}
        />
      )}
    </div>
  )
}

export default ChessBoard
