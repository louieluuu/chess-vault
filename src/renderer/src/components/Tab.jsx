// TODO: icon?

function Tab({ icon, label, view, setView }) {
  const isActive = view === label

  return (
    <button
      className={`tab tab--${label} ${isActive ? '' : 'tab--inactive'}`}
      onClick={() => setView(label)}
    >
      {label.toUpperCase()}
    </button>
  )
}

export default Tab
