import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import GameScreen from './components/GameScreen.jsx'
import History from './components/History.jsx'
import UpdateNotice from './components/UpdateNotice.jsx'
import ProfileEntry from './components/ProfileEntry.jsx'
import DeleteProfileDialog from './components/DeleteProfileDialog.jsx'
import { GAMES } from './games/index.jsx'
import {
  HISTORY_KEY,
  clearHistory,
  isStorageAvailable,
  profileEntries,
  readHistory,
  saveResult,
} from './storage.js'
import {
  ACTIVE_PROFILE_KEY,
  PROFILES_KEY,
  createProfile,
  deleteProfile,
  readActiveProfileId,
  readProfiles,
  setActiveProfile,
  signOut,
} from './profiles.js'
import { subscribeToUpdate } from './pwa.js'

function initialSession() {
  const id = readActiveProfileId()
  return id && readProfiles().some((p) => p.id === id) ? { profileId: id } : null
}

function countText(count) {
  if (count === 0) return 'Sin partidas todavía'
  return count === 1 ? '1 partida en este dispositivo' : `${count} partidas en este dispositivo`
}

function Home({ onPlay, history, storageAvailable, onClearHistory, profileName }) {
  return (
    <main className="page">
      <h1 className="page-title">Juegos de atención</h1>
      <p className="page-intro">
        Seis juegos cortos para entrenar la atención. Elige uno y juega las veces que quieras.
      </p>
      <div className="game-grid">
        {GAMES.map((game) => (
          <article className="game-card" key={game.id}>
            <div className="game-card-preview" aria-hidden="true">
              <game.preview />
            </div>
            <h2 className="game-card-title">{game.title}</h2>
            <p className="game-card-skill">{game.skill}</p>
            <p className="game-card-blurb">{game.blurb}</p>
            <button type="button" className="btn btn-primary btn-block" onClick={() => onPlay(game.id)}>
              Jugar
            </button>
          </article>
        ))}
      </div>
      <section className="notice">
        <h2 className="notice-title">¿Qué pasa al terminar?</h2>
        <p className="notice-text">
          Cada partida termina con una pantalla de resultados: aciertos, errores y tiempo de reacción.
        </p>
      </section>
      <History
        key={profileName}
        entries={history}
        available={storageAvailable}
        onClear={onClearHistory}
        profileName={profileName}
      />
    </main>
  )
}

export default function App() {
  const [view, setView] = useState({ name: 'home' })
  const [history, setHistory] = useState(readHistory)
  const [profiles, setProfiles] = useState(readProfiles)
  const [session, setSession] = useState(initialSession)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [storageAvailable] = useState(isStorageAvailable)
  const [updateReady, setUpdateReady] = useState(false)
  const [updateDismissed, setUpdateDismissed] = useState(false)

  const profile = session?.profileId ? profiles.find((p) => p.id === session.profileId) || null : null
  const profileName = profile ? profile.name : ''
  const myHistory = profileEntries(history, profileName)

  useEffect(() => subscribeToUpdate(() => setUpdateReady(true)), [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key === HISTORY_KEY) setHistory(readHistory())
      if (e.key === null || e.key === PROFILES_KEY) setProfiles(readProfiles())
      if (e.key === null || e.key === ACTIVE_PROFILE_KEY) {
        const id = readActiveProfileId()
        setSession((current) => {
          if (id) return current?.profileId === id ? current : { profileId: id }
          return current?.profileId ? null : current
        })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (session?.profileId && !profile) setSession(null)
  }, [session, profile])

  const goHome = () => {
    setView({ name: 'home' })
    window.scrollTo(0, 0)
  }

  const enter = (nextSession) => {
    setSession(nextSession)
    setView({ name: 'home' })
    window.scrollTo(0, 0)
  }

  const selectProfile = (id) => {
    setActiveProfile(id)
    enter({ profileId: id })
  }

  const create = (name) => {
    const result = createProfile(name, profiles)
    if (result.error) return result.error
    setProfiles(result.profiles)
    enter({ profileId: result.profile.id })
    return ''
  }

  const playAsGuest = () => {
    signOut()
    enter({ guest: true })
  }

  const leave = () => {
    signOut()
    setSession(null)
    setView({ name: 'home' })
    window.scrollTo(0, 0)
  }

  const removeProfile = () => {
    if (!profile) return
    const result = deleteProfile(profile.id, profiles)
    setProfiles(result.profiles)
    setHistory(result.history || readHistory())
    setConfirmingDelete(false)
    setSession(null)
    setView({ name: 'home' })
    window.scrollTo(0, 0)
  }

  const openGame = (id) => {
    setView({ name: 'game', id, stage: 'intro', run: 0, result: null })
    window.scrollTo(0, 0)
  }

  const finishGame = (game, result) => {
    const saved = saveResult(game, result, profileName)
    if (saved) setHistory(saved)
    setView((v) => ({ ...v, stage: 'results', result }))
  }

  const clearMine = () => {
    const next = clearHistory(profileName)
    setHistory(next || readHistory())
  }

  const playing = view.name === 'game' && view.stage === 'play'
  const game = view.name === 'game' ? GAMES.find((g) => g.id === view.id) : null
  const notice = updateReady && !updateDismissed && !playing && (
    <UpdateNotice onReload={() => window.location.reload()} onDismiss={() => setUpdateDismissed(true)} />
  )

  if (!session) {
    return (
      <>
        <ProfileEntry
          profiles={profiles}
          history={history}
          onSelect={selectProfile}
          onCreate={create}
          onGuest={playAsGuest}
        />
        {notice}
      </>
    )
  }

  return (
    <div className="app">
      <Header
        onHome={goHome}
        profile={profile}
        profileDetail={countText(myHistory.length)}
        onSwitch={leave}
        onSignOut={leave}
        onDeleteProfile={() => setConfirmingDelete(true)}
      />
      {view.name === 'home' ? (
        <Home
          onPlay={openGame}
          history={myHistory}
          storageAvailable={storageAvailable}
          onClearHistory={clearMine}
          profileName={profileName}
        />
      ) : (
        <GameScreen
          game={game}
          stage={view.stage}
          run={view.run}
          result={view.result}
          onStart={() => setView((v) => ({ ...v, stage: 'play' }))}
          onFinish={(result) => finishGame(game, result)}
          onReplay={() => setView((v) => ({ ...v, stage: 'play', run: v.run + 1, result: null }))}
          onBack={goHome}
        />
      )}
      {confirmingDelete && profile && (
        <DeleteProfileDialog
          name={profile.name}
          count={myHistory.length}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={removeProfile}
        />
      )}
      {notice}
    </div>
  )
}
