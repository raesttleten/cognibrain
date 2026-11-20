import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import './styles.css'
import App from './App.jsx'
import { registerServiceWorker } from './pwa.js'

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
