import { useEffect, useRef, useState } from 'react'
import { avg, formatMs, rand, shuffle, useSpace, useTimers } from '../utils.js'

const TOTAL = 36
const TARGETS = 9
const SHOW_MS = 900
const GAP_MS = 900
const LETTERS = ['K', 'M', 'P', 'R', 'T', 'L', 'N', 'H', 'B', 'D', 'F', 'S']

function buildSequence() {
  const others = Array.from({ length: TOTAL - TARGETS }, () => LETTERS[rand(0, LETTERS.length - 1)])
  return shuffle([...Array(TARGETS).fill('X'), ...others])
}

export default function ATodoFoco({ onFinish }) {
  const timers = useTimers()
  const [index, setIndex] = useState(-1)
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)
  const seq = useRef([])
  const data = useRef(null)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    const { hits, commissions, times } = data.current
    onFinish({
      title: '¡Muy concentrado!',
      items: [
        { value: `${hits} / ${TARGETS}`, label: 'X que tocaste' },
        { value: TARGETS - hits, label: 'X que se escapó' },
        { value: commissions, label: 'toques en otra letra' },
        { value: formatMs(avg(times)), label: 'tiempo de reacción' },
      ],
    })
  }

  const step = (i) => {
    if (i >= TOTAL) {
      finish()
      return
    }
    data.current.current = i
    data.current.shownAt = performance.now()
    setIndex(i)
    setVisible(true)
    timers.set(() => {
      setVisible(false)
      timers.set(() => step(i + 1), GAP_MS)
    }, SHOW_MS)
  }

  useEffect(() => {
    seq.current = buildSequence()
    data.current = { current: -1, shownAt: 0, answered: new Set(), hits: 0, commissions: 0, times: [] }
    done.current = false
    step(0)
  }, [])

  const respond = () => {
    const d = data.current
    if (!d || d.current < 0 || done.current) return
    setPressed(true)
    timers.set(() => setPressed(false), 150)
    if (d.answered.has(d.current)) return
    d.answered.add(d.current)
    if (seq.current[d.current] === 'X') {
      d.hits += 1
      d.times.push(performance.now() - d.shownAt)
    } else {
      d.commissions += 1
    }
  }

  useSpace(respond)

  const letter = index >= 0 && visible ? seq.current[index] : ''
  const progress = index < 0 ? 0 : ((index + 1) / TOTAL) * 100

  return (
    <div className="atf">
      <p className="stage-corner">Letra {Math.max(index + 1, 1)} de {TOTAL}</p>
      <button
        type="button"
        className={`atf-box${pressed ? ' is-pressed' : ''}`}
        onClick={respond}
        aria-label="Tocar"
      >
        <span className="atf-letter" aria-live="off">{letter}</span>
      </button>
      <p className="stage-hint">Toca solo cuando veas la X</p>
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
