import React from 'react'
import ReactDOM from 'react-dom/client'
import App       from './App.jsx'
import Verificar from './pages/Verificar.jsx'
import '@/styles/global.css'

// ─────────────────────────────────────────────────────────────
//  Enrutador simple — sin librería externa
//  /verificar/:folio  → página pública de verificación
//  cualquier otra ruta → app principal
// ─────────────────────────────────────────────────────────────

const path  = window.location.pathname
const match = path.match(/^\/verificar\/(.+)$/)
const folio = match ? decodeURIComponent(match[1]) : null

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {folio ? <Verificar folio={folio} /> : <App />}
  </React.StrictMode>
)