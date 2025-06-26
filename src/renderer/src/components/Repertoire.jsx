import Thumbnail from './Thumbnail'

import { FaRegTrashAlt } from 'react-icons/fa'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

function Repertoire({
  chess,
  history,
  repertoire,
  setFen,
  orientation,
  setOrientation,
  setRepertoire
}) {
  async function deleteOpening(openingName) {
    await window.db.deleteOpening(openingName)
    setRepertoire(await window.db.getRepertoire())
  }

  const filteredRepertoire = repertoire.filter((item) => {
    const historyString = history.join(' ')
    const variationString = pgnToMovesArray(item.pgn).join(' ')
    return item.orientation === orientation && variationString.startsWith(historyString)
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
    <>
      {/* Placed _outside_ of repertoire, because repertoire is a scrollview which has overflow properties that cuts off children elements that hang outside */}
      <SiChessdotcom
        className={`repertoire__icon${orientation === 'white' ? '--white' : '--black'}`}
      />

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
    </>
  )
}

export default Repertoire
