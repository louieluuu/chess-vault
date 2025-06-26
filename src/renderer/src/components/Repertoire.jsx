import Thumbnail from './Thumbnail'

import { FaRegTrashAlt } from 'react-icons/fa'

import { pgnToMovesArray } from '../utils/chess'

function Repertoire({ chess, history, repertoire, setFen, setOrientation, setRepertoire }) {
  async function deleteOpening(openingName) {
    await window.db.deleteOpening(openingName)
    setRepertoire(await window.db.getRepertoire())
  }

  const filteredRepertoire = repertoire.filter((item) => {
    if (!history || history.length === 0) {
      return true
    }

    const historyString = history.join(' ')
    const variationString = pgnToMovesArray(item.pgn).join(' ')
    return variationString.startsWith(historyString)
  })

  const groupedRepertoire = filteredRepertoire.reduce((acc, item) => {
    const openingName = item.opening || 'Unknown'
    if (!acc[openingName]) {
      acc[openingName] = []
    }
    acc[openingName].push(item)
    return acc
  }, {})

  const sortedOpeningNames = Object.keys(groupedRepertoire).sort((nameA, nameB) =>
    nameA.localeCompare(nameB)
  )

  return (
    <div className="repertoire">
      {sortedOpeningNames.map((openingName) => (
        <div key={openingName} className="opening-group">
          <h3 className="opening-group__name">
            {openingName}
            <FaRegTrashAlt
              className="opening-group__icon"
              onClick={() => deleteOpening(openingName)}
            />
          </h3>
          <div className="thumbnails-container">
            {groupedRepertoire[openingName].map((v) => (
              <Thumbnail
                key={v.id}
                chess={chess}
                variation={v}
                setFen={setFen}
                setOrientation={setOrientation}
                setRepertoire={setRepertoire}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Repertoire
