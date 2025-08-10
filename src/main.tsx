import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
// import { registerServiceWorker } from './sw-register' // Removed - VitePWA handles this
import './utils/offlineQueue'

// VitePWA automatically registers the service worker
// registerServiceWorker(); // Removed to prevent conflicts

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>,
) 