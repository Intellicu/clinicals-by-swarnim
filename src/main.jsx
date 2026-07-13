import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
// cache-bust: 2026-06-12

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Offline support — service worker caches the app shell + clinical pathway bundles
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}