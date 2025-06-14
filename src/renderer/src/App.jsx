import { useState, useEffect } from 'react'
import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess())
  const [orientation, setOrientation] = useState('white')
  const [variations, setVariations] = useState([])
  const [isStudying, setIsStudying] = useState(false)

  // Upon app load, get variations that are due to be studied
  useEffect(() => {
    async function getVariations() {
      setVariations(await window.db.getVariations())
    }
    getVariations()
  }, [])

  return (
    <div className="container">
      <ChessBoard
        chess={chess}
        orientation={orientation}
        isStudying={isStudying}
        setIsStudying={setIsStudying}
        setOrientation={setOrientation}
        variations={variations}
        setVariations={setVariations}
      />
      <Menu
        chess={chess}
        orientation={orientation}
        isStudying={isStudying}
        setIsStudying={setIsStudying}
        setVariations={setVariations}
        variations={variations}
      />
    </div>
  )
}

export default App
