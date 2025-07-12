import Grade from './Grade'

function GradeMenu({ options, homework, setHomework, setIsGrading }) {
  return (
    <div className="grade-menu">
      {options.map((option) => (
        <Grade
          key={option.desc}
          option={option}
          homework={homework}
          setHomework={setHomework}
          setIsGrading={setIsGrading}
        />
      ))}
    </div>
  )
}

export default GradeMenu
