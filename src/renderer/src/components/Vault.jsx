import React, { useState } from 'react'

import Thumbnail from './Thumbnail'

import { FaRegTrashAlt, FaArchive, FaRegListAlt } from 'react-icons/fa'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

function Vault({
  chess,
  history,
  setHistory,
  vault,
  setFen,
  orientation,
  setOrientation,
  setVault,
  setVariations
}) {
  const [view, setView] = useState('repertoire')

  async function deleteOpening(openingName) {
    await window.db.deleteOpening(openingName)
    setVault(await window.db.getVault())
  }

  const filteredVault = vault.filter((item) => {
    const historyString = history.join(' ')
    const variationString = pgnToMovesArray(item.pgn).join(' ')
    const variationCategory = item.active === 1 ? 'repertoire' : 'archive'
    return (
      item.orientation === orientation &&
      view === variationCategory &&
      variationString.startsWith(historyString)
    )
  })

  const groupedVault = filteredVault.reduce((acc, item) => {
    if (!item || !item.opening || typeof item.opening !== 'string') {
      return acc
    }
    const parts = item.opening.split(':')
    const familyName = parts[0].trim()
    const variationSuffix = parts.length > 1 ? parts.slice(1).join(':').trim() : ''

    if (!acc[familyName]) {
      acc[familyName] = {}
    }
    if (!acc[familyName][variationSuffix]) {
      acc[familyName][variationSuffix] = []
    }
    acc[familyName][variationSuffix].push(item)
    return acc
  }, {})

  const sortedFamilyNames = Object.keys(groupedVault).sort((nameA, nameB) =>
    nameA.localeCompare(nameB)
  )

  return (
    <>
      {/* Placed _outside_ of vault, because vault is a scrollview which has overflow properties that cuts off children elements that hang outside */}
      <SiChessdotcom className={`vault__icon${orientation === 'white' ? '--white' : '--black'}`} />

      <div className="vault">
        {/* Tabs */}
        <div className="tabs">
          <button className="view-btn__repertoire" onClick={() => setView('repertoire')}>
            Repertoire
          </button>
          <button className="view-btn__archive" onClick={() => setView('archive')}>
            Archive
          </button>
        </div>
        {sortedFamilyNames.map((familyName) => (
          <div key={familyName} className="opening-family">
            <div className="opening-family__group">
              <h3 className="opening-family__name">
                {familyName}
                <FaRegTrashAlt
                  className="opening-family__icon"
                  onClick={() => deleteOpening(familyName)}
                />
              </h3>
            </div>
            <div className="opening-variations">
              {Object.keys(groupedVault[familyName])
                .sort((a, b) => a.localeCompare(b))
                .map((variationSuffix) => (
                  <div key={variationSuffix} className="opening-variation">
                    <p className="opening-variation__name">{variationSuffix}</p>
                    <div className="thumbnails-container">
                      {groupedVault[familyName][variationSuffix].map((v) => (
                        <Thumbnail
                          key={v.id}
                          chess={chess}
                          variation={v}
                          view={view}
                          setFen={setFen}
                          setOrientation={setOrientation}
                          setVault={setVault}
                          setHistory={setHistory}
                          setVariations={setVariations}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Vault
