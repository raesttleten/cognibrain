export const HISTORY_KEY = 'cognibrain:history'
export const HISTORY_LIMIT = 100

function isEntry(entry) {
  return (
    entry &&
    typeof entry.gameId === 'string' &&
    typeof entry.gameTitle === 'string' &&
    typeof entry.date === 'string' &&
    Array.isArray(entry.items)
  )
}

export function isStorageAvailable() {
  try {
    const probe = `${HISTORY_KEY}:probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function readHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.filter(isEntry) : []
  } catch {
    return []
  }
}

export function saveResult(game, result) {
  try {
    const entry = {
      gameId: game.id,
      gameTitle: game.title,
      date: new Date().toISOString(),
      items: result.items.map(({ value, label }) => ({ value, label })),
    }
    const next = [entry, ...readHistory()].slice(0, HISTORY_LIMIT)
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    return next
  } catch {
    return null
  }
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY)
    return true
  } catch {
    return false
  }
}
