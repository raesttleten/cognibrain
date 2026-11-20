import { useEffect, useRef, useState } from 'react'
import Shape from '../components/Shape.jsx'
import { avg, formatSeconds, shuffle, useTimers } from '../utils.js'

const ROUNDS = 6
const MAX_WRONG = 3
export const PAIR_SHAPES = ['circle', 'square', 'triangle', 'diamond']
export const PAIR_TONES = ['#5e50a1', '#9e96c7', '#cfcbe3']

function buildBoard() {
  const combos = shuffle(PAIR_SHAPES.flatMap((shape) => PAIR_TONES.map((tone) => ({ shape, tone }))))
  const [pair, ...rest] = combos
  const cells = shuffle([pair, pair, ...rest.slice(0, 10)])
  return cells.map((c, id) => ({ ...c, id, key: `${c.shape}-${c.tone}` }))
}

export default function EncuentraElPar({ onFinish, onStatus }) {
  const timers = useTimers()
  const [board, setBoard] = useState(buildBoard)
  const [selected, setSelectedState] = useState(-1)
  const selectedRef = useRef(-1)
  const setSelected = (id) => {
    selectedRef.current = id
    setSelectedState(id)
  }
  const [flash, setFlash] = useState(null)
  const lockedRef = useRef(false)
  const setLocked = (value) => {
    lockedRef.current = value
  }
  const round = useRef(1)
  const wrongInRound = useRef(0)
  const startedAt = useRef(0)
  const stats = useRef({ found: 0, wrong: 0, times: [] })
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    const { found, wrong, times } = stats.current
    onFinish({
      title: '¡Gran atención al detalle!',
      items: [
        { value: `${found} / ${ROUNDS}`, label: 'pares encontrados' },
        { value: wrong, label: 'toques errados' },
        { value: formatSeconds(avg(times)), label: 'tiempo promedio por ronda' },
      ],
    })
  }

  const startRound = (r, fresh) => {
    round.current = r
    wrongInRound.current = 0
    onStatus?.(`Ronda ${r} de ${ROUNDS}`)
    if (fresh) setBoard(buildBoard())
    setSelected(-1)
    setFlash(null)
    setLocked(false)
    startedAt.current = performance.now()
  }

  useEffect(() => {
    stats.current = { found: 0, wrong: 0, times: [] }
    done.current = false
    startRound(1, false)
  }, [])

  const endRound = (found) => {
    stats.current.times.push(performance.now() - startedAt.current)
    if (found) stats.current.found += 1
    const pairIds = board.filter((c) => board.filter((o) => o.key === c.key).length === 2).map((c) => c.id)
    setFlash({ type: found ? 'right' : 'reveal', ids: pairIds })
    setLocked(true)
    timers.set(() => {
      if (round.current >= ROUNDS) finish()
      else startRound(round.current + 1, true)
    }, 1000)
  }

  const tap = (cell) => {
    if (lockedRef.current) return
    const selected = selectedRef.current
    if (selected === -1) {
      setSelected(cell.id)
      return
    }
    if (selected === cell.id) {
      setSelected(-1)
      return
    }
    const first = board[selected]
    if (first.key === cell.key) {
      setSelected(-1)
      endRound(true)
      return
    }
    stats.current.wrong += 1
    wrongInRound.current += 1
    setFlash({ type: 'wrong', ids: [selected, cell.id] })
    setSelected(-1)
    if (wrongInRound.current >= MAX_WRONG) {
      timers.set(() => endRound(false), 500)
      setLocked(true)
      return
    }
    timers.set(() => setFlash((f) => (f && f.type === 'wrong' ? null : f)), 500)
  }

  const hint =
    flash?.type === 'right'
      ? '¡Encontraste el par!'
      : flash?.type === 'reveal'
        ? 'Este era el par'
        : 'Toca las dos figuras iguales'

  return (
    <div className="pair">
      <div className="pair-grid">
        {board.map((cell) => {
          let state = ''
          if (selected === cell.id) state = ' is-selected'
          if (flash && flash.ids.includes(cell.id)) state = ` is-${flash.type}`
          return (
            <button
              key={`${round.current}-${cell.id}`}
              type="button"
              className={`tile pair-tile${state}`}
              onClick={() => tap(cell)}
              aria-label={`Figura ${cell.id + 1}`}
            >
              <Shape kind={cell.shape} color={cell.tone} size={56} />
            </button>
          )
        })}
      </div>
      <p className="stage-hint" aria-live="polite">{hint}</p>
    </div>
  )
}
