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

export function entryProfile(entry) {
  return typeof entry.profile === 'string' ? entry.profile : ''
}

export function profileEntries(history, profile) {
  return history.filter((entry) => entryProfile(entry) === profile)
}

function writeHistory(list) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

function limitPerProfile(list) {
  const counts = new Map()
  return list.filter((entry) => {
    const key = entryProfile(entry)
    const count = (counts.get(key) || 0) + 1
    counts.set(key, count)
    return count <= HISTORY_LIMIT
  })
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

export function saveResult(game, result, profile = '') {
  const entry = {
    gameId: game.id,
    gameTitle: game.title,
    date: new Date().toISOString(),
    profile,
    items: result.items.map(({ value, label }) => ({ value, label })),
  }
  const next = limitPerProfile([entry, ...readHistory()])
  return writeHistory(next) ? next : null
}

export function clearHistory(profile = '') {
  const next = readHistory().filter((entry) => entryProfile(entry) !== profile)
  return writeHistory(next) ? next : null
}
