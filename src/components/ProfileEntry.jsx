import { useId, useState } from 'react'
import logo from '../assets/logo-semillero-circle.png'
import userIcon from '../assets/user.svg'
import { profileEntries } from '../storage.js'

function dayDiff(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const start = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((start(new Date()) - start(date)) / 86400000)
}

const shortDate = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

function lastPlayed(iso) {
  const diff = dayDiff(iso)
  if (diff === null) return ''
  if (diff <= 0) return 'última hoy'
  if (diff === 1) return 'última ayer'
  return `última el ${shortDate.format(new Date(iso))}`
}

export function profileSummary(history, name) {
  const entries = profileEntries(history, name)
  if (entries.length === 0) return 'Sin partidas todavía'
  const count = entries.length === 1 ? '1 partida' : `${entries.length} partidas`
  const last = lastPlayed(entries[0].date)
  return last ? `${count} · ${last}` : count
}

export function sortProfiles(profiles, history) {
  const lastDate = (name) => profileEntries(history, name)[0]?.date || ''
  return [...profiles].sort((a, b) => {
    const byGame = lastDate(b.name).localeCompare(lastDate(a.name))
    return byGame || b.createdAt.localeCompare(a.createdAt)
  })
}

export function initialOf(name) {
  return Array.from(name.trim())[0]?.toLocaleUpperCase('es') || '?'
}

export default function ProfileEntry({ profiles, history, onSelect, onCreate, onGuest }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()
  const errorId = useId()
  const helpId = useId()
  const hasProfiles = profiles.length > 0
  const ordered = hasProfiles ? sortProfiles(profiles, history) : []

  const submit = (e) => {
    e.preventDefault()
    setError(onCreate(name))
  }

  return (
    <div className={`entry${hasProfiles ? ' entry-list' : ''}`}>
      <span className="entry-deco entry-deco-1" aria-hidden="true" />
      <span className="entry-deco entry-deco-2" aria-hidden="true" />
      <main className="entry-main">
        <section className="entry-card" aria-labelledby="entry-title">
          <div className="entry-head">
            <img className="entry-logo" src={logo} alt="Logo del semillero" />
            <h1 className="entry-title" id="entry-title">CogniBrain</h1>
            <p className="entry-sub">
              {hasProfiles ? 'Elige tu perfil o crea uno nuevo' : 'Ingresa con tu apodo o código para empezar'}
            </p>
          </div>

          {hasProfiles && (
            <>
              <h2 className="entry-list-label">Perfiles en este dispositivo</h2>
              <ul className="entry-profiles">
                {ordered.map((profile, index) => (
                  <li key={profile.id}>
                    <button
                      type="button"
                      className={`entry-profile${index === 0 ? ' is-recent' : ''}`}
                      onClick={() => onSelect(profile.id)}
                    >
                      <span className="entry-avatar" aria-hidden="true">{initialOf(profile.name)}</span>
                      <span className="entry-profile-data">
                        <span className="entry-profile-name">{profile.name}</span>
                        <span className="entry-profile-detail">{profileSummary(history, profile.name)}</span>
                      </span>
                      <span className="entry-profile-arrow" aria-hidden="true">›</span>
                    </button>
                  </li>
                ))}
              </ul>
              <hr className="entry-divider" />
            </>
          )}

          <form className="entry-form" onSubmit={submit} noValidate>
            <div className="entry-field-group">
              <label className="entry-label" htmlFor={inputId}>
                {hasProfiles ? 'Crear perfil nuevo' : 'Apodo o código'}
              </label>
              <div className={`entry-field${error ? ' has-error' : ''}`}>
                <img src={userIcon} alt="" width="22" height="22" />
                <input
                  id={inputId}
                  type="text"
                  value={name}
                  placeholder="Ej. Tigre12"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  autoFocus={!hasProfiles}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? `${errorId} ${helpId}` : helpId}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError('')
                  }}
                />
              </div>
              {error && (
                <p className="entry-error" id={errorId} role="alert">
                  {error}
                </p>
              )}
              <p className="entry-help" id={helpId}>
                <span className="entry-help-wide">Entre 2 y 20 caracteres. Usa un apodo o código, no tu nombre completo.</span>
                <span className="entry-help-narrow">Entre 2 y 20 caracteres. No uses tu nombre completo.</span>
              </p>
            </div>
            <button type="submit" className="entry-submit">
              {hasProfiles ? 'Crear y entrar' : 'Ingresar'}
            </button>
          </form>

          <button type="button" className="entry-guest" onClick={onGuest}>
            Jugar sin perfil
          </button>

          {!hasProfiles && (
            <>
              <hr className="entry-divider" />
              <div className="entry-foot">
                <p>Tus resultados se guardan solo en este dispositivo.</p>
                <p>No necesitas contraseña ni correo.</p>
              </div>
            </>
          )}
        </section>
        <p className="entry-footer">Universidad Católica de Colombia · Semillero de psicología</p>
      </main>
    </div>
  )
}
