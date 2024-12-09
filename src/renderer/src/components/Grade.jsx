function Grade({ time, desc, setIsGrading }) {
  function handleClick() {
    console.log(`You clicked ${desc}`)
    setIsGrading(false)
  }

  return (
    <div className="grade">
      <div className="grade-time">{time}</div>
      <button className="grade-button" onClick={handleClick}>
        {desc}
      </button>
    </div>
  )
}

export default Grade
