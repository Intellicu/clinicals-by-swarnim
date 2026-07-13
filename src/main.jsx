import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
// cache-bust: 2026-06-12

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Offline support — service worker caches the app shell + clinical pathway bundles.
// Production builds only: in the dev/preview sandbox it would interfere with
// Vite's on-the-fly module serving (breaks dynamic page imports).
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    // Remove any previously-registered worker + its caches from the preview
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => { if (k.startsWith('clinicals-')) caches.delete(k); })).catch(() => {});
    }
  }
}