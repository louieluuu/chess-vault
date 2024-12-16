import Grade from './Grade'

function GradingMenu({ grades, variations, currVariation, setCurrVariation, setIsGrading }) {
  return (
    <div className="grade-menu">
      {grades.map((grade) => (
        <Grade
          key={grade.desc}
          desc={grade.desc}
          interval={grade.interval}
          variations={variations}
          currVariation={currVariation}
          setCurrVariation={setCurrVariation}
          setIsGrading={setIsGrading}
        />
      ))}
    </div>
  )
}

export default GradingMenu
