import { clearHistory } from './storage.js'

export const PROFILES_KEY = 'cognibrain:profiles'
export const ACTIVE_PROFILE_KEY = 'cognibrain:active-profile'
export const NAME_MIN = 2
export const NAME_MAX = 20

export const ERROR_LENGTH = 'Escribe entre 2 y 20 caracteres.'
export const ERROR_DUPLICATE = 'Ya existe un perfil con ese nombre. Elígelo en la lista o usa otro.'

function isProfile(profile) {
  return (
    profile &&
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.createdAt === 'string'
  )
}

function writeProfiles(profiles) {
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
    return true
  } catch {
    return false
  }
}

function newId() {
  if (typeof window.crypto?.randomUUID === 'function') return window.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function readProfiles() {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.filter(isProfile) : []
  } catch {
    return []
  }
}

export function normalizeName(name) {
  return String(name ?? '').trim()
}

export function validateName(name, profiles) {
  const clean = normalizeName(name)
  if (clean.length < NAME_MIN || clean.length > NAME_MAX) return ERROR_LENGTH
  const key = clean.toLocaleLowerCase('es')
  if (profiles.some((p) => p.name.toLocaleLowerCase('es') === key)) return ERROR_DUPLICATE
  return ''
}

export function createProfile(name, profiles) {
  const error = validateName(name, profiles)
  if (error) return { error }
  const profile = { id: newId(), name: normalizeName(name), createdAt: new Date().toISOString() }
  const next = [...profiles, profile]
  writeProfiles(next)
  setActiveProfile(profile.id)
  return { profile, profiles: next }
}

export function readActiveProfileId() {
  try {
    return window.localStorage.getItem(ACTIVE_PROFILE_KEY) || null
  } catch {
    return null
  }
}

export function setActiveProfile(id) {
  try {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, id)
    return true
  } catch {
    return false
  }
}

export function signOut() {
  try {
    window.localStorage.removeItem(ACTIVE_PROFILE_KEY)
    return true
  } catch {
    return false
  }
}

export function deleteProfile(id, profiles) {
  const profile = profiles.find((p) => p.id === id)
  const next = profiles.filter((p) => p.id !== id)
  writeProfiles(next)
  if (readActiveProfileId() === id) signOut()
  const history = profile ? clearHistory(profile.name) : null
  return { profiles: next, history }
}
