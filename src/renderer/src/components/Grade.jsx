import { add, formatDistanceToNowStrict } from 'date-fns'

function Grade({ option, homework, setHomework, setIsGrading }) {
  const { desc, card } = option

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
    return abbreviate(formatDistanceToNowStrict(add(new Date(), { minutes: card.interval })))
  }

  function handleClick() {
    // Update db with the new info
    const { id } = homework[0]

    window.db.update({
      next_study: add(new Date(), { minutes: card.interval }).toISOString(),

      status: card.status,
      interval: card.interval,
      ease: card.ease,
      step: card.step,

      id: id
    })

    setHomework((prev) => prev.slice(1))
    setIsGrading(false)
  }

  return (
    <div className="grade">
      <span>{formatInterval(card.interval)}</span>
      <button className={`grade__button grade__button--${desc}`} onClick={handleClick}>
        {desc}
      </button>
    </div>
  )
}

export default Grade
