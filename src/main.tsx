// Festival Wristband — Auteur : Aurélien Moote - Moo - 2026 — Licence MIT
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
  })
}
