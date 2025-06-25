import Chessground from 'react-chessground'

function Repertoire({ chess, repertoire, setFen, setOrientation }) {
  function transferToMainBoard(fen, orientation, pgn) {
    chess.loadPgn(pgn)
    setFen(fen)
    setOrientation(orientation)
  }

  return (
    <div className="repertoire">
      {repertoire.map((r) => (
        <div
          key={r.id}
          className="thumbnail"
          onClick={() => transferToMainBoard(r.fen, r.orientation, r.pgn)}
        >
          <Chessground
            fen={r.fen}
            orientation={r.orientation}
            coordinates={false}
            viewOnly={true}
          />
        </div>
      ))}
    </div>
  )
}

export default Repertoire
