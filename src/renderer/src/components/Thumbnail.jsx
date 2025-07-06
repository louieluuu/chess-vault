import Chessground from 'react-chessground'

import { FaRegTrashAlt } from 'react-icons/fa'
import { LuFolderSymlink, LuFolderOutput } from 'react-icons/lu'

const THUMBNAIL_DIMENSION = '20dvh'

function Thumbnail({
  chess,
  variation,
  view,
  setFen,
  setOrientation,
  setVault,
  setHistory,
  setVariations
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
    if (view === 'repertoire') {
      await window.db.archiveVariation({
        id: variation.id
      })
    } else if (view === 'archive') {
      await window.db.activateVariation({
        id: variation.id
      })
    }
    setVariations(await window.db.getVariations())
    setVault(await window.db.getVault())
  }

  async function deleteVariation() {
    window.db.deleteVariation(variation)
    setVault(await window.db.getVault())
  }

  return (
    <div
      className={`thumbnail ${view === 'repertoire' ? 'thumbnail--repertoire' : 'thumbnail--archive'}`}
    >
      <div className="thumbnail__buttons">
        {view === 'repertoire' ? (
          <LuFolderSymlink className="thumbnail__icon" onClick={handleClick} />
        ) : (
          <LuFolderOutput className="thumbnail__icon" onClick={handleClick} />
        )}
        <FaRegTrashAlt className="thumbnail__icon" onClick={deleteVariation} />
      </div>
      {/* Anonymous div because Chessground doesn't accept onClick prop */}
      <div onClick={() => transferToMainBoard(orientation, pgn)}>
        <Chessground
          width={THUMBNAIL_DIMENSION}
          height={THUMBNAIL_DIMENSION}
          fen={fen}
          orientation={orientation}
          coordinates={false}
          viewOnly={true}
        />
      </div>
    </div>
  )
}

export default Thumbnail
