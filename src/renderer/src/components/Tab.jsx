import { useState } from 'react'

function Tab({ icon, label, backgroundColor, onClick, isActive }) {
  const [isHovered, setIsHovered] = useState(false)

  function getBackgroundColor() {
    if (isActive) {
      return backgroundColor
    }
    if (isHovered) {
      return 'hsl(0, 0%, 85%)'
    }
    return 'hsl(0, 0%, 80%)'
  }

  const tabStyles = {
    width: '100%',
    zIndex: -1,
    outline: 'none',
    paddingTop: '0.15rem',
    paddingBottom: '0.5rem',
    fontFamily: 'Orbitron',
    fontSize: '1rem',
    fontWeight: 'bold',
    letterSpacing: '0.3rem',
    backgroundColor: getBackgroundColor(),
    borderRadius: '0.5rem 2rem 0 0',
    cursor: 'pointer'
  }

  return (
    <button
      className={`tab${isActive ? '' : '--inactive'}`}
      onClick={onClick}
      style={tabStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  )
}

export default Tab
