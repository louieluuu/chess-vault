import Thumbnail from './Thumbnail'

function Repertoire({ chess, repertoire, setFen, setOrientation }) {
  return (
    <div className="repertoire">
      {repertoire.map((v) => (
        <Thumbnail
          key={v.id}
          chess={chess}
          variation={v}
          setFen={setFen}
          setOrientation={setOrientation}
        />
      ))}
    </div>
  )
}

export default Repertoire
