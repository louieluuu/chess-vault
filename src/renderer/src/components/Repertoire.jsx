import Thumbnail from './Thumbnail'

function Repertoire({ chess, repertoire, setFen, setOrientation }) {
  const groupedRepertoire = repertoire.reduce((acc, item) => {
    const openingName = item.opening
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
          <h3 className="opening-group__name">{openingName}</h3>
          <div className="thumbnails-container">
            {groupedRepertoire[openingName].map((v) => (
              <Thumbnail
                key={v.id}
                chess={chess}
                variation={v}
                setFen={setFen}
                setOrientation={setOrientation}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Repertoire
