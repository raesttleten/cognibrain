import { useEffect, useRef, useState } from 'react'
import seedbedLogo from '../assets/logo-semillero-circle.png'
import { initialOf } from './ProfileEntry.jsx'

function ProfileMenu({ profile, detail, onSwitch, onSignOut, onDelete }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const chipRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        chipRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <div className="profile" ref={wrapRef}>
      <button
        type="button"
        ref={chipRef}
        className="profile-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Hola, ${profile.name}. Menú de perfil`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="profile-avatar" aria-hidden="true">{initialOf(profile.name)}</span>
        <span className="profile-greeting" aria-hidden="true">Hola, {profile.name}</span>
        <span className="profile-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="profile-menu" role="menu" aria-label="Menú de perfil">
          <div className="profile-menu-data">
            <span className="profile-menu-name">{profile.name}</span>
            <span className="profile-menu-detail">{detail}</span>
          </div>
          <hr className="profile-menu-divider" />
          <button type="button" role="menuitem" className="profile-menu-item" onClick={choose(onSwitch)} autoFocus>
            Cambiar de perfil
          </button>
          <button type="button" role="menuitem" className="profile-menu-item" onClick={choose(onSignOut)}>
            Cerrar sesión
          </button>
          <hr className="profile-menu-divider" />
          <button type="button" role="menuitem" className="profile-menu-item is-danger" onClick={choose(onDelete)}>
            Borrar este perfil
          </button>
        </div>
      )}
    </div>
  )
}

export default function Header({ onHome, profile, profileDetail, onSwitch, onSignOut, onDeleteProfile }) {
  return (
    <header className="header">
      <button type="button" className="brand" onClick={onHome} aria-label="CogniBrain, ir a juegos">
        <img className="brand-logo" src={seedbedLogo} alt="Logo del semillero" width="42" height="40" />
        <span className="brand-text">
          <span className="brand-name">CogniBrain</span>
          <span className="brand-sub">Semillero de psicología</span>
        </span>
      </button>
      <div className="header-end">
        <button type="button" className="btn btn-primary btn-nav" onClick={onHome}>
          Juegos
        </button>
        {profile ? (
          <ProfileMenu
            profile={profile}
            detail={profileDetail}
            onSwitch={onSwitch}
            onSignOut={onSignOut}
            onDelete={onDeleteProfile}
          />
        ) : (
          <button type="button" className="btn btn-secondary btn-nav btn-profile-in" onClick={onSwitch}>
            Ingresar
          </button>
        )}
      </div>
    </header>
  )
}
