import { useEffect, useState } from 'react'
import star from '../assets/star.svg'

export function Instructions({ game, onStart }) {
  return (
    <div className="stage-center instructions">
      <div className="instructions-art" aria-hidden="true">
        <game.art />
      </div>
      <h2 className="instructions-title">Cómo se juega</h2>
      <p className="instructions-text">{game.how}</p>
      <p className="instructions-meta">{game.meta}</p>
      <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
        Empezar
      </button>
    </div>
  )
}

export function Results({ result, onBack, onReplay }) {
  return (
    <div className="stage-center results">
      <img className="results-star" src={star} alt="" width="64" height="64" />
      <h2 className="results-title">{result.title}</h2>
      <ul className="metrics">
        {result.items.map((item) => (
          <li className="metric" key={item.label}>
            <span className="metric-value">{item.value}</span>
            <span className="metric-label">{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="results-actions">
        <button type="button" className="btn btn-secondary btn-lg" onClick={onBack}>
          Volver a juegos
        </button>
        <button type="button" className="btn btn-primary btn-lg" onClick={onReplay}>
          Jugar otra vez
        </button>
      </div>
    </div>
  )
}

export default function GameScreen({ game, stage, run, result, onStart, onFinish, onReplay, onBack }) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    setStatus('')
  }, [stage, run])

  const shownStatus = stage === 'results' ? 'Terminado' : stage === 'play' ? status : ''
  const Game = game.Component

  return (
    <main className="page">
      <div className="game-head">
        <div className="game-head-main">
          <h1 className="page-title">{game.title}</h1>
          <span className="chip">{game.skill}</span>
        </div>
        <div className="game-head-side">
          {shownStatus && (
            <span className="game-status" aria-live="polite">
              {shownStatus}
            </span>
          )}
          <button type="button" className="btn btn-secondary btn-lg" onClick={onBack}>
            Volver a juegos
          </button>
        </div>
      </div>
      <section className="game-panel">
        <div className="stage">
          {stage === 'intro' && <Instructions game={game} onStart={onStart} />}
          {stage === 'play' && <Game key={run} onFinish={onFinish} onStatus={setStatus} />}
          {stage === 'results' && result && <Results result={result} onBack={onBack} onReplay={onReplay} />}
        </div>
      </section>
    </main>
  )
}
