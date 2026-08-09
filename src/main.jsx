import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'

/* ─── GSAP Global Registration ───────────────────────────────────────────── */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/* ─── Lenis Smooth Scroll (independent from GSAP) ────────────────────────── */
import { initLenis } from './utils/smoothScroll'
initLenis()

/* ─── Styles ─────────────────────────────────────────────────────────────── */
import './index.css'

import App from './App.jsx'
import { crudService } from './cms/services/crudService'

if (import.meta.env.DEV) {
  window.crudService = crudService;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)