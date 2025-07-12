import Chessground from 'react-chessground'

import ContextMenu from './ContextMenu'

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

  const items = [
    {
      icon: view === 'repertoire' ? <LuFolderSymlink /> : <LuFolderOutput />,
      label: view === 'repertoire' ? 'Archive' : 'Restore',
      action: view === 'repertoire' ? archiveVariation : restoreVariation
    },
    {
      icon: <FaRegTrashAlt />,
      label: 'Delete',
      action: deleteVariation
    }
  ]

  function transferToMainBoard(orientation, pgn) {
    chess.loadPgn(pgn)
    setFen(chess.fen())
    setOrientation(orientation)
    setHistory(chess.history())
    // TODO: setLastMove here to avoid visual bug where you make a move on main board and then press a thumbnail
  }

  async function updateVariations() {
    setVariations(await window.db.getVariations())
    setVault(await window.db.getVault())
  }

  async function archiveVariation() {
    await window.db.archiveVariation(variation)
    await updateVariations()
  }

  async function restoreVariation() {
    await window.db.restoreVariation(variation)
    await updateVariations()
  }

  async function deleteVariation() {
    window.db.deleteVariation(variation)
    await updateVariations()
  }

  return (
    <ContextMenu items={items}>
      {/* might need ContextMenu to go after the thumbnail div actually*/}
      <div
        className={`thumbnail ${view === 'repertoire' ? 'thumbnail--repertoire' : 'thumbnail--archive'}`}
      >
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
    </ContextMenu>
  )
}

export default Thumbnail
