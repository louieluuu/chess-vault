import Chessground from 'react-chessground'

function Thumbnail({ chess, variation, setFen, setOrientation }) {
  const { fen, orientation, pgn } = variation

  function transferToMainBoard(orientation, pgn) {
    chess.loadPgn(pgn)
    setFen(chess.fen())
    setOrientation(orientation)
    // TODO: setLastMove here to avoid visual bug where you make a move on main board and then press a thumbnail
  }

  return (
    <div className="thumbnail" onClick={() => transferToMainBoard(orientation, pgn)}>
      <Chessground fen={fen} orientation={orientation} coordinates={false} viewOnly={true} />
    </div>
  )
}

export default Thumbnail
