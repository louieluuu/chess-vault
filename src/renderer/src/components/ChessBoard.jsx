// TODO check purpose of pendingMove

// Documentation:
// https://github.com/ruilisi/react-chessground/blob/master/example/demo/src/App.js

// Ctrl+P for "index.d.ts", "chessground.css"

import React, { useState, useEffect } from 'react'

// Components
import GradeMenu from './GradeMenu'

import Chessground from 'react-chessground'
import 'react-chessground/dist/styles/chessground.css'

import { SQUARES } from 'chess.js'

import { Card, NUM_AUTO_MOVES_BLACK, NUM_AUTO_MOVES_WHITE, pgnToMovesArray } from '../utils/chess'

import { classifyOpening } from '../utils/openingClassifier'

import { playSound, playSoundMove, sounds } from '../utils/sound'

const BOARD_DIMENSION = '50dvh'
const PAUSE_MS = 500
const STUDY_MODE_ANIMATION_MS = 1000
const INCORRECT_LIMIT = 2

function ChessBoard({
  chess,
  fen,
  setFen,
  setHistory,
  orientation,
  setOrientation,
  pgn,
  setPgn,
  opening,
  setOpening,
  eco,
  setEco,
  isGrading,
  setIsGrading,
  isStudying,
  setIsStudying,
  variations,
  setVariations
}) {
  const [renderKey, setRenderKey] = useState(false)
  const [lastMove, setLastMove] = useState([])
  const [pendingMove, setPendingMove] = useState()
  const [selectVisible, setSelectVisible] = useState(false)
  const [selected, setSelected] = useState('')

  const [currCorrectMove, setCurrCorrectMove] = useState(0)
  const [countIncorrect, setCountIncorrect] = useState(0)

  const [options, setOptions] = useState([])

  /********************
   *    useEffects    *
   ********************/

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
        case 'arrowup':
          resetBoard()
          break
        case 'arrowleft':
          // TODO - no RAV support in chess.js as of now: https://github.com/jhlywa/chess.js/issues/522
          // For now, left arrow will just undo the move. Refactor after RAV support?
          undoMove()
          break
        case 'arrowright':
          // TODO
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isStudying])

  // Force re-render of chessboard after Study Mode animation ends to keep chess piece locations up to date - otherwise the board will not be interactable
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRenderKey((prev) => !prev)
    }, STUDY_MODE_ANIMATION_MS + 750)

    return () => clearTimeout(timeout)
  }, [isStudying])

  // Studying logic
  useEffect(() => {
    if (!isStudying) {
      return
    }

    resetBoard()
    playSound(sounds.nextVariation)

    const timeout = setTimeout(() => {
      // All variations finished
      if (variations.length === 0) {
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
    }, STUDY_MODE_ANIMATION_MS)

    return () => clearTimeout(timeout)
  }, [isStudying, variations])

  /********************
   * Helper functions *
   ********************/

  // Reset board to its initial state
  function resetBoard() {
    chess.reset()
    updateChessStates()
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
        makeMove(move)
        setCurrCorrectMove((prev) => prev + 1)
        playSoundMove(move)
      }, i * PAUSE_MS)
    }
  }

  // All states that need to get updated when a move is made
  function makeMove(move) {
    setLastMove([move.from, move.to])
    updateChessStates()
  }

  function updateChessStates() {
    setFen(chess.fen())
    setHistory(chess.history())
    setOpeningAndEcoFromHistory(chess.history())
  }

  function setOpeningAndEcoFromHistory(history) {
    const { name, eco } = classifyOpening(history)
    setOpening(name)
    setEco(eco)
  }

  function isCorrectMove(move) {
    return move === pgn[currCorrectMove]
  }

  function undoMove() {
    chess.undo()
    const currentHistory = chess.history({ verbose: true })
    if (currentHistory.length > 0) {
      const newLastMove = currentHistory[currentHistory.length - 1]
      setLastMove([newLastMove.from, newLastMove.to])
    } else {
      setLastMove(null)
    }
    updateChessStates()
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

  function onMove(from, to) {
    const move = chess.move({ from, to, promotion: 'x' }, { strict: true })

    // When not studying, any legal move is passable. Legality is already checked by the `movable` prop, so we just have to update states.
    if (!isStudying) {
      makeMove(move)
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
        makeMove(move)
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
        makeMove(response)
        playSoundMove(response)
        setCurrCorrectMove(nextCurrCorrectMove + 1)
      }

      // Reset
      setCountIncorrect(0)
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
    <div className={`chessboard ${isGrading ? 'chessboard--grading' : ''}`}>
      <Chessground
        key={renderKey}
        width={BOARD_DIMENSION}
        height={BOARD_DIMENSION}
        fen={fen}
        orientation={orientation}
        turnColor={chess.turn() === 'w' ? 'white' : 'black'}
        check={chess.inCheck()}
        lastMove={lastMove}
        selected={selected}
        coordinates={true}
        viewOnly={isGrading ? true : false}
        movable={calcMovable()}
        onMove={onMove}
      />
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
