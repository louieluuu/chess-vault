// TODO check purpose of lastMove and pendingMove

// Chessground styles
import 'react-chessground/dist/styles/chessground.css'

// Components
import GradeMenu from './GradeMenu'

// React icons
import { FaCircleCheck } from 'react-icons/fa6'
import { FaBook } from 'react-icons/fa'

import React, { useState, useEffect } from 'react'
import Chessground from 'react-chessground'
import { SQUARES } from 'chess.js'

import { Card, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE, pgnToMovesArray } from '../utils/chess'

import { playSound, playSoundMove, sounds } from '../utils/sound'

const BOARD_DIMENSION = '50dvh'
const PAUSE_MS = 500
const RESULT_MS = 2500
const INCORRECT_LIMIT = 2

function ChessBoard({
  chess,
  orientation,
  setOrientation,
  variations,
  setVariations,
  isStudying,
  setIsStudying
}) {
  const [fen, setFen] = useState('')
  const [pgn, setPgn] = useState([])
  const [lastMove, setLastMove] = useState([])
  const [pendingMove, setPendingMove] = useState()
  const [selectVisible, setSelectVisible] = useState(false)
  const [selected, setSelected] = useState('')

  const [currCorrectMove, setCurrCorrectMove] = useState(0)
  const [countIncorrect, setCountIncorrect] = useState(0)

  const [result, setResult] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [options, setOptions] = useState([])

  /********************
   *    useEffects    *
   ********************/

  // Hide result icon after some time
  useEffect(() => {
    const timeout = setTimeout(() => {
      setResult('')
    }, RESULT_MS)

    return () => clearTimeout(timeout)
  }, [result])

  // Keyboard shortcuts
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
        case 'arrowup':
          resetBoard()
          break
        case 'arrowleft':
          // TODO
          break
        case 'arrowright':
          // TODO
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isStudying, lastMove])

  // While studying: variation end logic
  useEffect(() => {
    if (!isStudying) {
      return
    }

    resetBoard()

    // All variations finished
    if (variations.length === 0) {
      setResult('booked')
      playSound(sounds.booked)
      setIsStudying(false)
      return
    }

    // Else, next variation
    // Set chessboard states
    const { pgn, orientation } = variations[0]
    const pgnMoves = pgnToMovesArray(pgn)
    setPgn(pgnMoves)
    setOrientation(orientation)
    autoMove(pgnMoves, orientation)

    // Reset other states
    setCurrCorrectMove(0)
    setCountIncorrect(0)

    playSound(sounds.nextVariation)
  }, [isStudying, variations])

  /********************
   * Helper functions *
   ********************/

  // Reset board to its initial state
  function resetBoard() {
    chess.reset()
    setFen(chess.fen())
    setLastMove(null)
  }

  // Flip the orientation of the board
  function flipBoard() {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'))
  }

  // Auto-move the first couple of moves so the player knows which variation is pulled up
  function autoMove(pgnMoves, orientation) {
    const numAutoMoves = orientation === 'white' ? NUM_AUTO_MOVES_WHITE : NUM_AUTO_MOVES_BLACK
    for (let i = 0; i < numAutoMoves; ++i) {
      setTimeout(() => {
        const move = chess.move(pgnMoves[i])
        setLastMove([move.from, move.to])
        setFen(chess.fen())
        setCurrCorrectMove((prev) => prev + 1)
        playSoundMove(move)
      }, i * PAUSE_MS)
    }
  }

  function isCorrectMove(move) {
    return move === pgn[currCorrectMove]
  }

  function undoMove() {
    chess.undo()
    setLastMove((prev) => [...prev]) // force re-render
    setFen(chess.fen())
  }

  function highlightCorrectSquare() {
    // "Fake move" the correct move so we can obtain the correct square, then immediately undo. No UI updates required.
    const correctSquare = chess.move(pgn[currCorrectMove]).from
    chess.undo()

    setSelected(correctSquare)
    setTimeout(() => {
      setSelected('')
    }, PAUSE_MS * 2)
  }

  function showResult(result) {
    const className = `chessboard__result--${result}`
    switch (result) {
      case 'correct':
        return <FaCircleCheck className={className} />
      case 'booked':
        return <FaBook className={className} />
      default:
        return null
    }
  }

  function onMove(from, to) {
    const move = chess.move({ from, to, promotion: 'x' }, { strict: true })

    // When not studying, any legal move is passable. Legality is already checked by the `movable` prop, so we just have to update states.
    if (!isStudying) {
      setLastMove([from, to])
      setFen(chess.fen())
      playSoundMove(move)

      return
    }

    // When studying, a move must be checked against the variation

    // Incorrect move
    if (!isCorrectMove(move.san)) {
      playSound(sounds.incorrect)

      setTimeout(() => {
        undoMove()

        const newCountIncorrect = countIncorrect + 1
        if (newCountIncorrect >= INCORRECT_LIMIT) {
          highlightCorrectSquare()
        }
        setCountIncorrect(newCountIncorrect)
      }, PAUSE_MS)

      return
    }

    // Correct move
    playSoundMove(move)

    setTimeout(() => {
      const nextCurrCorrectMove = currCorrectMove + 1

      // If current variation is finished...
      if (nextCurrCorrectMove >= pgn.length) {
        setLastMove([move.from, move.to])
        setResult('correct')
        playSound(sounds.correct)

        const curr = variations[0]

        const options = new Card(
          curr.status,
          curr.interval,
          curr.ease,
          curr.step
        ).calculateOptions()

        setOptions(options)
        setIsGrading(true)
      }

      // Else variation is ongoing, computer plays the response
      else {
        const response = chess.move(pgn[nextCurrCorrectMove])
        setLastMove([response.from, response.to])
        playSoundMove(response)
        setCurrCorrectMove(nextCurrCorrectMove + 1)
      }

      // Reset
      setCountIncorrect(0)
      setFen(chess.fen())
    }, PAUSE_MS)
  }

  // Calculate the movable squares for the current turn
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
      color: chess.turn() === 'w' ? 'white' : 'black',
      dests,
      free: false
    }
  }

  return (
    <div className="chessboard">
      <Chessground
        width={BOARD_DIMENSION}
        height={BOARD_DIMENSION}
        fen={fen}
        orientation={orientation}
        turnColor={chess.turn() === 'w' ? 'white' : 'black'}
        lastMove={lastMove}
        selected={selected}
        movable={calcMovable()}
        onMove={onMove}
      />
      <div className="chessboard__result">{showResult(result)}</div>
      {isGrading && (
        <GradeMenu
          options={options}
          variations={variations}
          setVariations={setVariations}
          setIsGrading={setIsGrading}
        />
      )}
    </div>
  )
}

export default ChessBoard
