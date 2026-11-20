import { useCallback, useEffect, useMemo, useRef } from 'react'

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

export function avg(values) {
  if (!values.length) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function formatMs(ms) {
  return ms == null ? '—' : `${Math.round(ms)} ms`
}

export function formatSeconds(ms) {
  if (ms == null) return '—'
  const s = ms / 1000
  const text = s >= 10 ? String(Math.round(s)) : s.toFixed(1).replace('.', ',')
  return `${text} s`
}

export function useTimers() {
  const ids = useRef(new Set())

  const clear = useCallback(() => {
    ids.current.forEach((id) => clearTimeout(id))
    ids.current.clear()
  }, [])

  const set = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      ids.current.delete(id)
      fn()
    }, ms)
    ids.current.add(id)
    return id
  }, [])

  useEffect(() => clear, [clear])

  return useMemo(() => ({ set, clear }), [set, clear])
}

export function useSpace(handler, active = true) {
  const ref = useRef(handler)
  ref.current = handler

  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      e.preventDefault()
      if (e.repeat) return
      ref.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}
