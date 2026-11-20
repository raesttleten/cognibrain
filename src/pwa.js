const CHECK_EVERY_MS = 60 * 60 * 1000
const listeners = new Set()
let updateReady = false

function notify() {
  if (updateReady) return
  updateReady = true
  listeners.forEach((listener) => listener())
}

export function subscribeToUpdate(listener) {
  if (updateReady) listener()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function registerServiceWorker() {
  if (!__PWA__ || !import.meta.env.PROD) return
  if (!('serviceWorker' in navigator) || !window.location.protocol.startsWith('http')) return

  const hadController = Boolean(navigator.serviceWorker.controller)

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) notify()
  })

  const register = () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((registration) => {
        const check = () => {
          if (navigator.onLine) registration.update().catch(() => {})
        }
        setInterval(check, CHECK_EVERY_MS)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check()
        })
      })
      .catch(() => {})
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register)
}
