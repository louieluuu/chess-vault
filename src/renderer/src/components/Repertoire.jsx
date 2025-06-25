import Chessground from 'react-chessground'

const BOARD_DIMENSION = '10dvh'

function Repertoire({ repertoire }) {
  console.log(repertoire)

  return (
    <div className="repertoire">
      {repertoire.map((variation) => (
        <div key={variation.id} className="chessboard">
          <Chessground
            width={BOARD_DIMENSION}
            height={BOARD_DIMENSION}
            fen={variation.fen}
            orientation={variation.orientation}
            coordinates={false}
            viewOnly={true}
          />
        </div>
      ))}
    </div>
  )
}

export default Repertoire
