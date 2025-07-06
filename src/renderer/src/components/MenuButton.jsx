// Reference for passing in a react-icon as a prop:
// https://stackoverflow.com/questions/70765677/can-you-pass-different-material-ui-icons-as-props/70766229

function MenuButton({ icon, label, onClick, isDisabled }) {
  return (
    <button
      className={`menu-button ${isDisabled ? 'menu-button--disabled' : ''}`}
      onClick={(e) => {
        if (!isDisabled) {
          onClick?.(e)
        }
      }}
    >
      <div className={`menu-button__icon ${isDisabled ? 'menu-button__icon--disabled' : ''}`}>
        {icon}
      </div>
      <pre className="menu-button__text">{label}</pre>
    </button>
  )
}

export default MenuButton
