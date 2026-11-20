import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import GameScreen from './components/GameScreen.jsx'
import History from './components/History.jsx'
import UpdateNotice from './components/UpdateNotice.jsx'
import { GAMES } from './games/index.jsx'
import { HISTORY_KEY, clearHistory, isStorageAvailable, readHistory, saveResult } from './storage.js'
import { subscribeToUpdate } from './pwa.js'

function Home({ onPlay, history, storageAvailable, onClearHistory }) {
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
      <History entries={history} available={storageAvailable} onClear={onClearHistory} />
    </main>
  )
}

export default function App() {
  const [view, setView] = useState({ name: 'home' })
  const [history, setHistory] = useState(readHistory)
  const [storageAvailable] = useState(isStorageAvailable)
  const [updateReady, setUpdateReady] = useState(false)
  const [updateDismissed, setUpdateDismissed] = useState(false)

  useEffect(() => subscribeToUpdate(() => setUpdateReady(true)), [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key === HISTORY_KEY) setHistory(readHistory())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const goHome = () => {
    setView({ name: 'home' })
    window.scrollTo(0, 0)
  }

  const openGame = (id) => {
    setView({ name: 'game', id, stage: 'intro', run: 0, result: null })
    window.scrollTo(0, 0)
  }

  const finishGame = (game, result) => {
    const saved = saveResult(game, result)
    if (saved) setHistory(saved)
    setView((v) => ({ ...v, stage: 'results', result }))
  }

  const clearAll = () => {
    clearHistory()
    setHistory(readHistory())
  }

  const playing = view.name === 'game' && view.stage === 'play'
  const game = view.name === 'game' ? GAMES.find((g) => g.id === view.id) : null

  return (
    <div className="app">
      <Header onHome={goHome} />
      {view.name === 'home' ? (
        <Home
          onPlay={openGame}
          history={history}
          storageAvailable={storageAvailable}
          onClearHistory={clearAll}
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
      {updateReady && !updateDismissed && !playing && (
        <UpdateNotice onReload={() => window.location.reload()} onDismiss={() => setUpdateDismissed(true)} />
      )}
    </div>
  )
}
