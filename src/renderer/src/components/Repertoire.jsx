import Chessground from 'react-chessground'

const THUMBNAIL_DIMENSION = '10dvh'

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
          className="chessboard"
          onClick={() => transferToMainBoard(r.fen, r.orientation, r.pgn)}
        >
          <Chessground
            width={THUMBNAIL_DIMENSION}
            height={THUMBNAIL_DIMENSION}
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
