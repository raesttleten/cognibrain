import { useEffect, useRef, useState } from 'react'
import Shape from '../components/Shape.jsx'
import { formatSeconds, rand, shuffle, useTimers } from '../utils.js'

const CELLS = 32
const STARS = 12
const OTHERS = ['circle', 'triangle', 'square']
export const HUNT_COLOR = '#9c93c4'

function buildBoard() {
  const others = Array.from({ length: CELLS - STARS }, () => OTHERS[rand(0, OTHERS.length - 1)])
  return shuffle([...Array(STARS).fill('star'), ...others]).map((kind, id) => ({ id, kind, state: '' }))
}

export default function CazaFiguras({ onFinish }) {
  const timers = useTimers()
  const [board, setBoard] = useState(buildBoard)
  const startedAt = useRef(0)
  const done = useRef(false)

  const found = board.filter((c) => c.state === 'found').length
  const wrong = board.filter((c) => c.state === 'wrong').length

  useEffect(() => {
    startedAt.current = performance.now()
    done.current = false
  }, [])

  const finish = (cells) => {
    if (done.current) return
    done.current = true
    const f = cells.filter((c) => c.state === 'found').length
    const w = cells.filter((c) => c.state === 'wrong').length
    onFinish({
      title: '¡Gran cazador!',
      items: [
        { value: `${f} / ${STARS}`, label: 'estrellas encontradas' },
        { value: STARS - f, label: 'estrellas sin encontrar' },
        { value: w, label: 'figuras equivocadas' },
        { value: formatSeconds(performance.now() - startedAt.current), label: 'tiempo total' },
      ],
    })
  }

  useEffect(() => {
    if (found === STARS) timers.set(() => finish(board), 600)
  }, [found])

  const tap = (cell) => {
    if (cell.state || done.current) return
    setBoard((prev) =>
      prev.map((c) => (c.id === cell.id && !c.state ? { ...c, state: c.kind === 'star' ? 'found' : 'wrong' } : c)),
    )
  }

  return (
    <div className="hunt">
      <h2 className="stage-title">Toca todas las estrellas. Hay {STARS} escondidas.</h2>
      <div className="hunt-grid">
        {board.map((cell) => (
          <button
            key={cell.id}
            type="button"
            className={`tile hunt-tile${cell.state ? ` is-${cell.state}` : ''}`}
            onClick={() => tap(cell)}
            aria-label={`Figura ${cell.id + 1}`}
            aria-pressed={Boolean(cell.state)}
          >
            <Shape kind={cell.kind} color={cell.state === 'found' ? '#d9a441' : cell.state === 'wrong' ? '#d9707f' : HUNT_COLOR} size={36} />
          </button>
        ))}
      </div>
      <p className="stage-hint hunt-count" aria-live="polite">
        Encontradas: {found} de {STARS}
        {wrong > 0 && <span className="hunt-wrong"> · Equivocadas: {wrong}</span>}
      </p>
      <button type="button" className="btn btn-secondary btn-lg stage-bottom" onClick={() => finish(board)}>
        Ver resultados
      </button>
    </div>
  )
}
