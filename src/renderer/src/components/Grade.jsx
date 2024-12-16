import { add, formatDistanceToNowStrict } from 'date-fns'

function Grade({ desc, interval, variations, currVariation, setCurrVariation, setIsGrading }) {
  function abbreviate(date) {
    const abbreviations = {
      minute: 'm',
      minutes: 'm',
      hour: 'h',
      hours: 'h',
      day: 'd',
      days: 'd',
      month: 'm',
      months: 'm',
      year: 'y',
      years: 'y'
    }

    return date
      .replace(
        /\b(minute|minutes|hour|hours|day|days|month|months|year|years)\b/g,
        (match) => abbreviations[match]
      )
      .replace(' ', '')
  }

  function formatInterval() {
    return abbreviate(formatDistanceToNowStrict(add(new Date(), { minutes: interval })))
  }

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
      <div className="grade__interval">{formatInterval(interval)}</div>
      <button className={`grade__button--${desc}`} onClick={handleClick}>
        {desc}
      </button>
    </div>
  )
}

export default Grade
