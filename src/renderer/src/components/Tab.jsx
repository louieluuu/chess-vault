import { useState } from 'react'

function Tab({ icon, label, backgroundColor, onClick, isActive }) {
  const [isHovered, setIsHovered] = useState(false)

  function getBackgroundColor() {
    if (isActive) {
      return backgroundColor
    }
    if (isHovered) {
      return 'hsl(0, 0%, 30%)'
    }
    return 'hsl(0, 0%, 25%)'
  }

  const tabStyles = {
    height: isActive ? '1.8rem' : '1.5rem',
    color: isActive ? 'black' : 'hsl(0, 0%, 50%)',
    cursor: isActive ? 'default' : 'pointer',
    backgroundColor: getBackgroundColor(),

    width: '100%',
    outline: 'none',
    fontFamily: 'Orbitron',
    fontSize: '1rem',
    fontWeight: 'bold',
    letterSpacing: '0.3rem',
    borderRadius: '0.5rem 2rem 0 0'
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
