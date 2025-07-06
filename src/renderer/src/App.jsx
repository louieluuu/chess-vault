import { useState, useEffect } from 'react'

// Components
import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import PgnInput from './components/PgnInput'
import Vault from './components/Vault'

import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess()) // TODO should this be a state...?
  const [fen, setFen] = useState('')
  const [orientation, setOrientation] = useState('white')
  const [pgn, setPgn] = useState([]) // TODO: this isn't necessary, can just obtain via currVariation.pgn. Refactor out at some point.
  const [history, setHistory] = useState([])
  const [opening, setOpening] = useState('')
  const [eco, setEco] = useState('')
  const [vault, setVault] = useState([])
  const [variations, setVariations] = useState([])
  const [isStudying, setIsStudying] = useState(false)

  // Upon app load, get variations that are due to be studied
  useEffect(() => {
    async function getVault() {
      setVault(await window.db.getVault())
    }
    async function getVariations() {
      setVariations(await window.db.getVariations())
    }
    getVault()
    getVariations()
  }, [])

  return (
    <div className={`app ${isStudying ? 'app--studying' : ''}`}>
      <div className="study">
        <Menu
          chess={chess}
          orientation={orientation}
          opening={opening}
          eco={eco}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
          variations={variations}
          setVariations={setVariations}
          setVault={setVault}
        />
        <ChessBoard
          chess={chess}
          fen={fen}
          setFen={setFen}
          setHistory={setHistory}
          orientation={orientation}
          setOrientation={setOrientation}
          opening={opening}
          setOpening={setOpening}
          eco={eco}
          setEco={setEco}
          pgn={pgn}
          setPgn={setPgn}
          variations={variations}
          setVariations={setVariations}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
        />
        <PgnInput
          chess={chess}
          setEco={setEco}
          setFen={setFen}
          setHistory={setHistory}
          setOpening={setOpening}
        />
      </div>
      <Vault
        chess={chess}
        setFen={setFen}
        history={history}
        setHistory={setHistory}
        isStudying={isStudying}
        orientation={orientation}
        setOrientation={setOrientation}
        setVariations={setVariations}
        vault={vault}
        setVault={setVault}
      />
    </div>
  )
}

export default App
