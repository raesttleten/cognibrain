import { useEffect, useRef, useState } from 'react'
import { rand, useTimers } from '../utils.js'

export const PATTERN_COLORS = ['#6f8faf', '#8fb39a', '#d2ae68', '#c08a7c']
const START_LENGTH = 2
const MAX_LENGTH = 9
const MAX_ROUNDS = MAX_LENGTH - START_LENGTH + 1
const LIT_MS = 600
const GAP_MS = 300

export default function RepiteElPatron({ onFinish, onStatus }) {
  const timers = useTimers()
  const [phase, setPhaseState] = useState('show')
  const phaseRef = useRef('show')
  const setPhase = (next) => {
    phaseRef.current = next
    setPhaseState(next)
  }
  const [lit, setLit] = useState(-1)
  const [round, setRound] = useState(1)
  const [wrong, setWrong] = useState(-1)
  const seq = useRef([])
  const pos = useRef(0)
  const stats = useRef({ longest: 0, completed: 0, errors: 0 })
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    const { longest, completed, errors } = stats.current
    onFinish({
      title: '¡Gran memoria!',
      items: [
        { value: longest, label: 'colores seguidos que recordaste' },
        { value: completed, label: 'rondas completadas' },
        { value: errors, label: 'errores' },
      ],
    })
  }

  const playRound = (r) => {
    setRound(r)
    onStatus?.(`Ronda ${r} de ${MAX_ROUNDS}`)
    setPhase('show')
    setLit(-1)
    pos.current = 0
    seq.current.forEach((color, i) => {
      const start = 700 + i * (LIT_MS + GAP_MS)
      timers.set(() => setLit(color), start)
      timers.set(() => setLit(-1), start + LIT_MS)
    })
    timers.set(() => setPhase('input'), 700 + seq.current.length * (LIT_MS + GAP_MS))
  }

  useEffect(() => {
    seq.current = Array.from({ length: START_LENGTH }, () => rand(0, 3))
    stats.current = { longest: 0, completed: 0, errors: 0 }
    done.current = false
    playRound(1)
  }, [])

  const press = (i) => {
    if (phaseRef.current !== 'input') return
    setLit(i)
    timers.set(() => setLit((c) => (c === i ? -1 : c)), 250)
    if (seq.current[pos.current] !== i) {
      stats.current.errors += 1
      setWrong(i)
      setPhase('fail')
      timers.set(finish, 1100)
      return
    }
    pos.current += 1
    if (pos.current < seq.current.length) return
    stats.current.completed += 1
    stats.current.longest = seq.current.length
    setPhase('ok')
    if (seq.current.length >= MAX_LENGTH) {
      timers.set(finish, 900)
      return
    }
    seq.current = [...seq.current, rand(0, 3)]
    timers.set(() => playRound(round + 1), 900)
  }

  const titles = {
    show: `Ronda ${round}: mira el patrón`,
    input: `Ronda ${round}: tu turno`,
    ok: '¡Muy bien!',
    fail: 'Ese no era el cuadro',
  }
  const hints = {
    show: 'Mira con atención',
    input: 'Toca los cuadros en el mismo orden',
    ok: 'Viene una ronda más larga',
    fail: 'Fin de la partida',
  }

  return (
    <div className="rep">
      <h2 className="stage-title">{titles[phase]}</h2>
      <div className="rep-grid">
        {PATTERN_COLORS.map((color, i) => (
          <button
            key={color}
            type="button"
            className={`rep-cell${lit === i ? ' is-lit' : ''}${wrong === i ? ' is-wrong' : ''}`}
            style={{ '--cell': color }}
            onClick={() => press(i)}
            disabled={phase !== 'input'}
            aria-label={`Cuadro ${i + 1}`}
          />
        ))}
      </div>
      <p className="stage-hint">{hints[phase]}</p>
    </div>
  )
}
