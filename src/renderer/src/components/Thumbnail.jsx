import Chessground from 'react-chessground'

import { FaRegTrashAlt } from 'react-icons/fa'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'

function Thumbnail({ chess, variation, setFen, setOrientation, setVault }) {
  const { fen, orientation, pgn } = variation

  function transferToMainBoard(orientation, pgn) {
    chess.loadPgn(pgn)
    setFen(chess.fen())
    setOrientation(orientation)
    // TODO: setLastMove here to avoid visual bug where you make a move on main board and then press a thumbnail
  }

  function archiveVariation() {
    // TODO
  }

  async function deleteVariation() {
    window.db.deleteVariation(variation)
    setVault(await window.db.getVault())
  }

  return (
    <div className="thumbnail">
      <div className="thumbnail__options">
        <FaArrowRightArrowLeft className="thumbnail__icon" onClick={archiveVariation} />
        <FaRegTrashAlt className="thumbnail__icon" onClick={deleteVariation} />
      </div>
      <div className="chessboard" onClick={() => transferToMainBoard(orientation, pgn)}>
        <Chessground fen={fen} orientation={orientation} coordinates={false} viewOnly={true} />
      </div>
    </div>
  )
}

export default Thumbnail
