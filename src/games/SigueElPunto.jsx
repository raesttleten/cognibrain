import { useEffect, useRef, useState } from 'react'
import { avg, formatSeconds, useTimers } from '../utils.js'

const ROUNDS = 5
const DOTS = 6
const MARK_MS = 1500
const MOVES = 3
const MOVE_MS = 900
const FEEDBACK_MS = 1000

function randomPositions() {
  const points = []
  let tries = 0
  while (points.length < DOTS && tries < 500) {
    tries += 1
    const p = { x: 8 + Math.random() * 84, y: 14 + Math.random() * 76 }
    if (points.every((q) => Math.hypot(q.x - p.x, (q.y - p.y) * 0.6) > 14)) points.push(p)
  }
  while (points.length < DOTS) points.push({ x: 8 + Math.random() * 84, y: 14 + Math.random() * 76 })
  return points
}

export default function SigueElPunto({ onFinish, onStatus }) {
  const timers = useTimers()
  const [positions, setPositions] = useState(randomPositions)
  const [target, setTarget] = useState(0)
  const [phase, setPhase] = useState('mark')
  const [picked, setPicked] = useState(-1)
  const stats = useRef({ hits: 0, times: [] })
  const askedAt = useRef(0)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    const { hits, times } = stats.current
    onFinish({
      title: '¡Ojos de águila!',
      items: [
        { value: `${hits} / ${ROUNDS}`, label: 'veces que lo seguiste' },
        { value: formatSeconds(avg(times)), label: 'tiempo de respuesta' },
      ],
    })
  }

  const playRound = (r) => {
    onStatus?.(`Ronda ${r} de ${ROUNDS}`)
    setPicked(-1)
    setPositions(randomPositions())
    setTarget(Math.floor(Math.random() * DOTS))
    setPhase('mark')
    timers.set(() => {
      setPhase('move')
      for (let m = 0; m < MOVES; m++) {
        timers.set(() => setPositions(randomPositions()), m * MOVE_MS)
      }
      timers.set(() => {
        askedAt.current = performance.now()
        setPhase('ask')
      }, MOVES * MOVE_MS)
    }, MARK_MS)
  }

  const round = useRef(1)

  useEffect(() => {
    stats.current = { hits: 0, times: [] }
    round.current = 1
    done.current = false
    playRound(1)
  }, [])

  const pick = (i) => {
    if (phase !== 'ask') return
    stats.current.times.push(performance.now() - askedAt.current)
    if (i === target) stats.current.hits += 1
    setPicked(i)
    setPhase('feedback')
    timers.set(() => {
      if (round.current >= ROUNDS) {
        finish()
        return
      }
      round.current += 1
      playRound(round.current)
    }, FEEDBACK_MS)
  }

  const prompts = {
    mark: 'Mira el punto marcado',
    move: 'No le quites la mirada',
    ask: '¿Cuál era el punto marcado?',
    feedback: picked === target ? '¡Lo encontraste!' : 'Era el punto verde',
  }

  return (
    <div className="dot">
      <p className="dot-prompt" aria-live="polite">{prompts[phase]}</p>
      <div className={`dot-area${phase === 'move' ? ' is-moving' : ''}`}>
        {positions.map((p, i) => {
          let state = ''
          if (phase === 'mark' && i === target) state = ' is-marked'
          if (phase === 'feedback' && i === target) state = ' is-right'
          if (phase === 'feedback' && i === picked && i !== target) state = ' is-wrong'
          return (
            <button
              key={i}
              type="button"
              className={`dot-item${state}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => pick(i)}
              disabled={phase !== 'ask'}
              aria-label={`Punto ${i + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
