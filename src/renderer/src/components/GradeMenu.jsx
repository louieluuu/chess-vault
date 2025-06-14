import Grade from './Grade'

function GradeMenu({ options, variations, setVariations, setIsGrading }) {
  return (
    <div className="grade-menu">
      {options.map((option) => (
        <Grade
          key={option.desc}
          option={option}
          variations={variations}
          setVariations={setVariations}
          setIsGrading={setIsGrading}
        />
      ))}
    </div>
  )
}

export default GradeMenu
