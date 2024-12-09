import Grade from './Grade'

function GradingMenu({ setIsGrading }) {
  return (
    <div className="grade-menu">
      <Grade time={'< 1 min'} desc={'Again'} setIsGrading={setIsGrading} />
      <Grade time={'10 mins'} desc={'Hard'} setIsGrading={setIsGrading} />
      <Grade time={'4 days'} desc={'Good'} setIsGrading={setIsGrading} />
      <Grade time={'7 days'} desc={'Easy'} setIsGrading={setIsGrading} />
    </div>
  )
}

export default GradingMenu
