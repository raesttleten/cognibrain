import brain from '../assets/brain.svg'
import seedbedLogo from '../assets/logo-semillero-header.png'

export default function Header({ onHome }) {
  return (
    <header className="header">
      <div className="header-start">
        <button type="button" className="brand" onClick={onHome} aria-label="CogniBrain, ir a juegos">
          <span className="brand-logo">
            <img src={brain} alt="" width="24" height="24" />
          </span>
          <span className="brand-text">
            <span className="brand-name">CogniBrain</span>
            <span className="brand-sub">Semillero de psicología</span>
          </span>
        </button>
        <img
          className="seedbed-logo"
          src={seedbedLogo}
          alt="Logo del semillero de investigación CogniBrain"
          width="42"
          height="40"
        />
      </div>
      <button type="button" className="btn btn-primary btn-nav" onClick={onHome}>
        Juegos
      </button>
    </header>
  )
}
