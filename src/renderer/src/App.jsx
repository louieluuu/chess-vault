import { useState, useEffect } from 'react'

import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import Repertoire from './components/Repertoire'

import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess())
  const [fen, setFen] = useState('')
  const [orientation, setOrientation] = useState('white')
  const [pgn, setPgn] = useState([]) // TODO: this isn't necessary, can just obtain via currVariation.pgn. Refactor out at some point.
  const [repertoire, setRepertoire] = useState([])
  const [variations, setVariations] = useState([])
  const [isStudying, setIsStudying] = useState(false)

  // Upon app load, get variations that are due to be studied
  useEffect(() => {
    async function getRepertoire() {
      setRepertoire(await window.db.getRepertoire())
    }
    async function getVariations() {
      setVariations(await window.db.getVariations())
    }
    getRepertoire()
    getVariations()
  }, [])

  return (
    <div className="container">
      <div className="container__variations">
        <Menu
          chess={chess}
          orientation={orientation}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
          setVariations={setVariations}
          variations={variations}
        />
        <ChessBoard
          chess={chess}
          fen={fen}
          setFen={setFen}
          orientation={orientation}
          setOrientation={setOrientation}
          pgn={pgn}
          setPgn={setPgn}
          variations={variations}
          setVariations={setVariations}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
        />
      </div>
      <Repertoire
        chess={chess}
        repertoire={repertoire}
        setFen={setFen}
        setOrientation={setOrientation}
        setPgn={setPgn}
      />
    </div>
  )
}

export default App
