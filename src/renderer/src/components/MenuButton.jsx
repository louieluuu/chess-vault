// Reference for passing in a react-icon as a prop:
// https://stackoverflow.com/questions/70765677/can-you-pass-different-material-ui-icons-as-props/70766229

function MenuButton({ icon, label, onClick, isDisabled }) {
  return (
    <button
      className={`menu__btn${isDisabled ? '--disabled' : ''}`}
      onClick={(e) => {
        if (!isDisabled) {
          onClick?.(e)
        }
      }}
    >
      <div className={`menu__icon${isDisabled ? '--disabled' : ''}`}>{icon}</div>
      {label}
    </button>
  )
}

export default MenuButton
