import { add } from 'date-fns'

function Grade({ desc, interval, variations, currVariation, setCurrVariation, setIsGrading }) {
  function handleClick() {
    // Update db with the new info
    const { next_study, id } = variations[currVariation]

    window.db.update({
      next_study: add(new Date(next_study), { minutes: interval }).toISOString(),
      id: id
    })

    console.log(`You clicked ${desc}`)

    setCurrVariation((prev) => prev + 1)
    setIsGrading(false)
  }

  return (
    <div className="grade">
      <div className="grade__interval">{interval}</div>
      <button className={`grade__button--${desc}`} onClick={handleClick}>
        {desc}
      </button>
    </div>
  )
}

export default Grade
