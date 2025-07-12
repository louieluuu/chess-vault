import React, { useState, useEffect } from 'react'

import Thumbnail from './Thumbnail'
import Tab from './Tab'
import ContextMenu from './ContextMenu'

import { FaRegTrashAlt } from 'react-icons/fa'
import { LuFolderSymlink, LuFolderOutput } from 'react-icons/lu'
import { SiChessdotcom } from 'react-icons/si'

import { pgnToMovesArray } from '../utils/chess'

const REPERTOIRE_EXPLANATION = `
The Repertoire contains variations that you actively want to review. 


To add to your Repertoire: manually play through a variation on the main board or paste a PGN, then click Save Variation.
`

const ARCHIVE_EXPLANATION = `
The Archive contains variations that you no longer want to review for now, but also do not want to delete forever.


To archive: right click an opening name or a thumbnail, then select Archive.
`

function Vault({
  chess,
  setFen,
  history,
  setHistory,
  isStudying,
  orientation,
  setOrientation,
  setHomework,
  vault,
  setVault
}) {
  const [view, setView] = useState('repertoire')

  // TODO: efficiency?
  const items = [
    {
      icon: view === 'repertoire' ? <LuFolderSymlink /> : <LuFolderOutput />,
      label: view === 'repertoire' ? 'Archive' : 'Restore',
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

  // TODO
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
          {filteredVault.length === 0 && (
            <span className="vault__explanation">
              {view === 'repertoire' ? REPERTOIRE_EXPLANATION : ARCHIVE_EXPLANATION}
            </span>
          )}
          {/* Hide thumbnails changing during Study Mode animation */}
          {!isStudying &&
            sortedFamilyNames.map((familyName) => (
              <div key={familyName} className="opening-family">
                <div className={`opening-family__name opening-family__name--${view}`}>
                  {familyName}
                </div>
                <div className="opening-variations">
                  {Object.keys(groupedVault[familyName])
                    .sort((a, b) => a.localeCompare(b))
                    .map((variationSuffix) => (
                      <div key={variationSuffix} className="opening-variation">
                        <div className={`opening-variation__name opening-variation__name--${view}`}>
                          {variationSuffix}
                        </div>
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
                              setHomework={setHomework}
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
