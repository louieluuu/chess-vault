import Chessground from 'react-chessground'

import ContextMenu from './ContextMenu'

import { FaRegTrashAlt } from 'react-icons/fa'
import { LuFolderSymlink, LuFolderOutput } from 'react-icons/lu'

const THUMBNAIL_DIMENSION = '20dvh'

const items = [
  {
    icon: <LuFolderSymlink />,
    label: 'Archive',
    action: () => {
      console.log('Archive')
    }
  },
  {
    icon: <FaRegTrashAlt />,
    label: 'Delete',
    action: () => {
      console.log('Delete')
    }
  }
]

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

  // TODO: rewrite into own functions
  // TODO: PS. thumbnail__icon is the className
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
