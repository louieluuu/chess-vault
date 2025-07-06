import { useState, useRef } from 'react'

// Utils
import { classifyOpening } from '../utils/openingClassifier'

const TIMEOUT_MS = 666

function PgnInput({ chess, setEco, setFen, setHistory, setOpening }) {
  const inputRef = useRef(null)
  const [text, setText] = useState('')
  const [isFading, setIsFading] = useState(false)

  function handlePaste(e) {
    const pastedText = e.clipboardData?.getData('text')
    setText(pastedText)

    try {
      chess.loadPgn(pastedText)
    } catch (error) {
      console.error('Invalid PGN. Oh no! Anyways...')
    }

    setFen(chess.fen())
    setHistory(chess.history())
    const { name, eco } = classifyOpening(chess.history())
    setOpening(name)
    setEco(eco)

    // TODO setLastMove

    setTimeout(() => {
      setIsFading(true)
      inputRef.current.blur()
    }, TIMEOUT_MS)

    // Reset
    setTimeout(() => {
      setText('')
      setIsFading(false)
    }, TIMEOUT_MS + 1000)
  }

  return (
    <input
      readOnly
      ref={inputRef}
      className={`pgn-input ${isFading ? 'pgn-input--fading' : ''}`}
      type="text"
      value={text}
      placeholder="Paste PGN here..."
      onPaste={handlePaste}
    />
  )
}

export default PgnInput

// TODO remove when you're done with it
// 1. e4 c5 2. c3 d5 3. exd5 Qxd5 4. d4 cxd4 5. cxd4 Nc6 6. Nf3 Bg4 7. Be2 Bxf3 8. Bxf3 Nxd4 9. Qxd4 Qxd4 10. Be3
