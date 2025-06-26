import Thumbnail from './Thumbnail'

import { FaRegTrashAlt } from 'react-icons/fa'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

function Vault({ chess, history, vault, setFen, orientation, setOrientation, setVault }) {
  async function deleteOpening(openingName) {
    await window.db.deleteOpening(openingName)
    setVault(await window.db.getVault())
  }

  const filteredVault = vault.filter((item) => {
    const historyString = history.join(' ')
    const variationString = pgnToMovesArray(item.pgn).join(' ')
    return item.orientation === orientation && variationString.startsWith(historyString)
  })

  const groupedVault = filteredVault.reduce((acc, item) => {
    const openingName = item.opening || 'Unknown'
    if (!acc[openingName]) {
      acc[openingName] = []
    }
    acc[openingName].push(item)
    return acc
  }, {})

  const sortedOpeningNames = Object.keys(groupedVault).sort((nameA, nameB) =>
    nameA.localeCompare(nameB)
  )

  return (
    <>
      {/* Placed _outside_ of vault, because vault is a scrollview which has overflow properties that cuts off children elements that hang outside */}
      <SiChessdotcom className={`vault__icon${orientation === 'white' ? '--white' : '--black'}`} />

      <div className="vault">
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
              {groupedVault[openingName].map((v) => (
                <Thumbnail
                  key={v.id}
                  chess={chess}
                  variation={v}
                  setFen={setFen}
                  setOrientation={setOrientation}
                  setVault={setVault}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Vault
