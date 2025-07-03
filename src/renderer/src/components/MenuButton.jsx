// Reference for passing in a react-icon as a prop:
// https://stackoverflow.com/questions/70765677/can-you-pass-different-material-ui-icons-as-props/70766229

// TODO styles belong in here, Vue style

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
      <pre style={{ fontFamily: 'Segoe UI' }}>{label}</pre>
    </button>
  )
}

export default MenuButton
