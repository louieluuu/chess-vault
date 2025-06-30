import Chessground from 'react-chessground'

import { FaRegTrashAlt } from 'react-icons/fa'
import { LuFolderSymlink, LuFolderOutput } from 'react-icons/lu'

function Thumbnail({
  chess,
  variation,
  isRepertoireMode,
  setFen,
  setOrientation,
  setVault,
  setHistory
}) {
  const { fen, orientation, pgn } = variation

  function transferToMainBoard(orientation, pgn) {
    chess.loadPgn(pgn)
    setFen(chess.fen())
    setOrientation(orientation)
    setHistory(chess.history())
    // TODO: setLastMove here to avoid visual bug where you make a move on main board and then press a thumbnail
  }

  async function handleClick() {
    const { id } = variation.id
    if (isRepertoireMode) {
      await window.db.archiveVariation({
        id: variation.id
      })
    } else {
      await window.db.activateVariation({
        id: variation.id
      })
    }
    setVault(await window.db.getVault())
  }

  async function deleteVariation() {
    window.db.deleteVariation(variation)
    setVault(await window.db.getVault())
  }

  return (
    <div className="thumbnail">
      <div className="thumbnail__options">
        {isRepertoireMode ? (
          <LuFolderSymlink className="thumbnail__icon" onClick={handleClick} />
        ) : (
          <LuFolderOutput className="thumbnail__icon" onClick={handleClick} />
        )}
        <FaRegTrashAlt className="thumbnail__icon" onClick={deleteVariation} />
      </div>
      <div className="chessboard" onClick={() => transferToMainBoard(orientation, pgn)}>
        <Chessground fen={fen} orientation={orientation} coordinates={false} viewOnly={true} />
      </div>
    </div>
  )
}

export default Thumbnail
