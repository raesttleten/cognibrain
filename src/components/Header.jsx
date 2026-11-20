import brain from '../assets/brain.svg'

export default function Header({ onHome }) {
  return (
    <header className="header">
      <button type="button" className="brand" onClick={onHome} aria-label="CogniBrain, ir a juegos">
        <span className="brand-logo">
          <img src={brain} alt="" width="24" height="24" />
        </span>
        <span className="brand-text">
          <span className="brand-name">CogniBrain</span>
          <span className="brand-sub">Semillero de psicología</span>
        </span>
      </button>
      <button type="button" className="btn btn-primary btn-nav" onClick={onHome}>
        Juegos
      </button>
    </header>
  )
}
