import { useState, useEffect, useRef } from 'react'

function ContextMenu({ children, items }) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef() // ref for the area that triggers the context menu
  const menuRef = useRef() // New ref for the actual context menu div

  useEffect(() => {
    // Add event listener to the document to close the menu when clicking anywhere else
    const handleClickOutside = (event) => {
      // Check if the click was outside the context menu itself
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVisible(false)
      }
    }

    if (visible) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [visible]) // Re-run effect when 'visible' changes

  function handleItemClick(action) {
    setVisible(false)
    action()
  }

  function handleContextMenu(e) {
    e.preventDefault() // Prevent default browser context menu

    // Use e.clientX and e.clientY for position relative to the viewport
    // Then set position to fixed for the context menu div
    setPosition({ x: e.clientX, y: e.clientY })
    setVisible(true)
  }

  return (
    <div ref={ref} onContextMenu={handleContextMenu}>
      {children}
      {visible && (
        // Set position: 'fixed' here for true viewport positioning
        <div
          ref={menuRef} // Assign the new ref to the context menu div
          style={{
            position: 'fixed', // Key change: position fixed relative to viewport
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
          className="context-menu"
        >
          {items.map((item, index) => (
            // Ensure multiple elements within map are wrapped (as discussed previously)
            <button
              key={index}
              className="context-menu__item"
              onClick={() => {
                handleItemClick(item.action)
              }}
            >
              <div className="context-menu__icon">{item.icon}</div>
              <div className="context-menu__label">{item.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContextMenu
