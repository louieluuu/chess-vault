import { useState } from 'react'
import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess())
  const [orientation, setOrientation] = useState('white')
  const [variations, setVariations] = useState([])
  const [isStudying, setIsStudying] = useState(false)
  const [isGrading, setIsGrading] = useState(false)

  return (
    <div className="container">
      <ChessBoard
        chess={chess}
        orientation={orientation}
        isStudying={isStudying}
        setIsStudying={setIsStudying}
        setIsGrading={setIsGrading}
        setOrientation={setOrientation}
        variations={variations}
      />
      <Menu
        chess={chess}
        orientation={orientation}
        setIsStudying={setIsStudying}
        setVariations={setVariations}
      />
    </div>
  )
}

export default App
