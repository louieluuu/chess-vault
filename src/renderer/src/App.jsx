import { useState, useEffect } from 'react'

import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import Repertoire from './components/Repertoire'

import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess())
  const [orientation, setOrientation] = useState('white')
  const [opening, setOpening] = useState('')
  const [eco, setEco] = useState('')
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
          opening={opening}
          eco={eco}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
          variations={variations}
          setVariations={setVariations}
        />
        <ChessBoard
          chess={chess}
          orientation={orientation}
          setOrientation={setOrientation}
          opening={opening}
          setOpening={setOpening}
          eco={eco}
          setEco={setEco}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
          variations={variations}
          setVariations={setVariations}
        />
      </div>
      <Repertoire repertoire={repertoire} />
    </div>
  )
}

export default App
