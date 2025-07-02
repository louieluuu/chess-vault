import React, { useState } from 'react'

import Thumbnail from './Thumbnail'
import Tab from './Tab'

import { FaRegTrashAlt } from 'react-icons/fa'
// TODO tab icons?
// import { FaBookBookmark, FaFolderOpen } from 'react-icons/fa6'
// import { FaBook, FaBookOpen } from 'react-icons/fa6'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

const REPERTOIRE_COLOR = 'hsl(200, 75%, 75%)'
const ARCHIVE_COLOR = 'hsl(50, 75%, 75%)'

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

  // Colors
  const VAULT_COLOR =
    view === 'repertoire' ? 'hsla(204, 7%, 14%, 97.5%)' : 'hsla(60, 15%, 15%, 97.5%)'

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

      <div className="vault" style={{ backgroundColor: VAULT_COLOR }}>
        {/* Tabs */}
        <div className="tabs">
          <Tab
            label="REPERTOIRE"
            backgroundColor={REPERTOIRE_COLOR}
            onClick={() => setView('repertoire')}
            isActive={view === 'repertoire'}
          />

          <Tab
            label="ARCHIVE"
            backgroundColor={ARCHIVE_COLOR}
            onClick={() => setView('archive')}
            isActive={view === 'archive'}
          />
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
