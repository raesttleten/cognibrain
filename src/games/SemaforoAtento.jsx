import { useEffect, useRef, useState } from 'react'
import { avg, formatMs, shuffle, useSpace, useTimers } from '../utils.js'

const TOTAL = 10
const GREENS = 6
const LIGHT_MS = 1500
const GAP_MS = 350

export default function SemaforoAtento({ onFinish, onStatus }) {
  const timers = useTimers()
  const [light, setLight] = useState('off')
  const [over, setOver] = useState(false)
  const [pressed, setPressed] = useState(false)
  const seq = useRef([])
  const data = useRef(null)
  const done = useRef(false)

  const step = (i) => {
    if (i >= TOTAL) {
      data.current.current = -1
      setLight('off')
      setOver(true)
      onStatus?.('Luces terminadas')
      return
    }
    onStatus?.(`Luz ${i + 1} de ${TOTAL}`)
    data.current.current = i
    data.current.shownAt = performance.now()
    setLight(seq.current[i])
    timers.set(() => {
      data.current.current = -1
      setLight('off')
      timers.set(() => step(i + 1), GAP_MS)
    }, LIGHT_MS)
  }

  useEffect(() => {
    seq.current = shuffle([...Array(GREENS).fill('green'), ...Array(TOTAL - GREENS).fill('red')])
    data.current = { current: -1, shownAt: 0, answered: new Set(), hits: 0, reds: 0, times: [] }
    done.current = false
    timers.set(() => step(0), 600)
  }, [])

  const respond = () => {
    const d = data.current
    if (!d || over) return
    setPressed(true)
    timers.set(() => setPressed(false), 150)
    if (d.current < 0 || d.answered.has(d.current)) return
    d.answered.add(d.current)
    if (seq.current[d.current] === 'green') {
      d.hits += 1
      d.times.push(performance.now() - d.shownAt)
    } else {
      d.reds += 1
    }
  }

  useSpace(respond, !over)

  const finish = () => {
    if (done.current) return
    done.current = true
    const { hits, reds, times } = data.current
    onFinish({
      title: '¡Muy atento!',
      items: [
        { value: `${hits} / ${GREENS}`, label: 'verdes que tocaste' },
        { value: GREENS - hits, label: 'verdes que se escaparon' },
        { value: reds, label: 'rojas que tocaste' },
        { value: formatMs(avg(times)), label: 'tiempo de reacción' },
      ],
    })
  }

  return (
    <div className="sem">
      <div className="sem-light" aria-hidden="true">
        <span className={`sem-bulb is-${light}`} />
      </div>
      <p className="stage-title sem-title">
        {over ? '¡Listo! Ya pasaron todas las luces' : 'Toca solo cuando la luz esté verde'}
      </p>
      <button
        type="button"
        className={`btn btn-primary sem-tap${pressed ? ' is-pressed' : ''}`}
        onClick={respond}
        disabled={over}
      >
        ¡Toca!
      </button>
      <p className="stage-note">La luz cambia sola cada segundo y medio.</p>
      <button type="button" className="btn btn-secondary btn-lg stage-bottom" onClick={finish} disabled={!over}>
        Ver resultados
      </button>
    </div>
  )
}
