import React, { useState, useEffect } from 'react'

import Thumbnail from './Thumbnail'
import Tab from './Tab'

import { FaRegTrashAlt } from 'react-icons/fa'
// TODO tab icons?
// import { FaBookBookmark, FaFolderOpen } from 'react-icons/fa6'
// import { FaBook, FaBookOpen } from 'react-icons/fa6'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

function Vault({
  chess,
  setFen,
  history,
  setHistory,
  isStudying,
  orientation,
  setOrientation,
  setVariations,
  vault,
  setVault
}) {
  const [view, setView] = useState('repertoire')

  // Keyboard shortcuts
  useEffect(() => {
    // Disable keyboard shortcuts when studying
    if (isStudying) {
      return
    }

    function handleKeyDown(e) {
      switch (e.key.toLowerCase()) {
        case 'a':
          setView('archive')
          break
        case 'r':
          setView('repertoire')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isStudying])

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
      <div className={`vault ${isStudying ? 'vault--studying' : ''}`}>
        {/* Tabs */}
        <div className={`tabs tabs--${view}`}>
          <Tab label="repertoire" view={view} setView={setView} />
          <Tab label="archive" view={view} setView={setView} />
        </div>

        {/* Pawn icon */}
        <SiChessdotcom
          className={`vault__pawn ${orientation === 'white' ? 'vault__pawn--white' : 'vault__pawn--black'}`}
        />

        {/* Scrollview */}
        <div className={`vault__scrollview vault__scrollview--${view}`}>
          {/* Hide thumbnails during Study Mode animation */}
          {!isStudying &&
            sortedFamilyNames.map((familyName) => (
              <div key={familyName} className="opening-family">
                <div className="opening-family__group">
                  <div className="opening-family__name">
                    {familyName}
                    <FaRegTrashAlt
                      className="opening-family__icon"
                      onClick={() => deleteOpening(familyName)}
                    />
                  </div>
                </div>
                <div className="opening-variations">
                  {Object.keys(groupedVault[familyName])
                    .sort((a, b) => a.localeCompare(b))
                    .map((variationSuffix) => (
                      <div key={variationSuffix} className="opening-variation">
                        <p className="opening-variation__name">{variationSuffix}</p>
                        <div className="vault__thumbnails">
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
      </div>
    </>
  )
}

export default Vault
