// Reference for passing in a react-icon as a prop:
// https://stackoverflow.com/questions/70765677/can-you-pass-different-material-ui-icons-as-props/70766229

// TODO styles belong in here, Vue style

function MenuButton({ icon, label, onClick, isDisabled }) {
  return (
    <button
      className="flex flex-row justify-center items-center gap-4 bg-zinc-700 px-5 cursor-pointer rounded-lg text-base"
      onClick={(e) => {
        if (!isDisabled) {
          onClick?.(e)
        }
      }}
    >
      <div className="text-yellow-400 text-2xl">{icon}</div>
      <pre className="">{label}</pre>
    </button>
  )
}

export default MenuButton
