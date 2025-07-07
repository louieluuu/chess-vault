import { FaExternalLinkAlt } from 'react-icons/fa'

function AnalysisLink({ pgn, orientation, hidden }) {
  return (
    <a
      className={`analysis-link analysis-link${hidden ? '--hidden' : ''}`}
      href={`https://lichess.org/analysis/pgn/${pgn}?color=${orientation}`}
      target="_blank"
    >
      <FaExternalLinkAlt />
    </a>
  )
}

export default AnalysisLink
