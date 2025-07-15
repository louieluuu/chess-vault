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
  const [history, setHistory] = useState([]) // TODO: is this necessary? can't just use chess.history()?
  const [opening, setOpening] = useState('')
  const [eco, setEco] = useState('')
  const [vault, setVault] = useState([])
  const [homework, setHomework] = useState([])
  const [isGrading, setIsGrading] = useState(false)
  const [isStudying, setIsStudying] = useState(false)

  // Upon app load, get homework that are due to be studied
  useEffect(() => {
    async function getVault() {
      setVault(await window.db.getVault())
    }
    async function getHomework() {
      setHomework(await window.db.getHomework())
    }
    getVault()
    getHomework()
  }, [])

  return (
    <div className={`app ${isStudying ? 'app--studying' : ''}`}>
      <div className="study">
        <Menu
          chess={chess}
          orientation={orientation}
          opening={opening}
          eco={eco}
          setIsGrading={setIsGrading}
          isStudying={isStudying}
          setIsStudying={setIsStudying}
          homework={homework}
          setHomework={setHomework}
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
          homework={homework}
          setHomework={setHomework}
          isGrading={isGrading}
          setIsGrading={setIsGrading}
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
        setHomework={setHomework}
        vault={vault}
        setVault={setVault}
      />
    </div>
  )
}

export default App
