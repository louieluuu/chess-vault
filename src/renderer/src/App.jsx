import { useState } from 'react'
import ChessBoard from './components/ChessBoard'
import Menu from './components/Menu'
import { Chess } from 'chess.js'

function App() {
  const [chess, setChess] = useState(new Chess())
  const [orientation, setOrientation] = useState('white')

  return (
    <div className="container">
      <ChessBoard chess={chess} orientation={orientation} setOrientation={setOrientation} />
      <Menu chess={chess} orientation={orientation} />
    </div>
  )
}

export default App
