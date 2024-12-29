import Grade from './Grade'

function GradeMenu({ options, variations, currVariation, setCurrVariation, setIsGrading }) {
  return (
    <div className="grade-menu">
      {options.map((option) => (
        <Grade
          key={option.desc}
          option={option}
          variations={variations}
          currVariation={currVariation}
          setCurrVariation={setCurrVariation}
          setIsGrading={setIsGrading}
        />
      ))}
    </div>
  )
}

export default GradeMenu
