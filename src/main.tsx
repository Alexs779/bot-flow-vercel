import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { init } from '@telegram-apps/sdk'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

const renderApp = () => {
  const webApp = window.Telegram?.WebApp
  if (webApp) {
    webApp.ready()
    webApp.expand()
    console.log('[MAIN] Telegram WebApp is ready and expanded.')
  } else {
    console.warn('[MAIN] Telegram WebApp is not available. Running in standard browser mode.')
  }

  // Only use StrictMode in development for detecting side effects
  if (import.meta.env.DEV) {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } else {
    root.render(<App />)
  }
}

// Initialize Telegram SDK
try {
  init()
  console.log('[MAIN] Telegram SDK initialization called.')
} catch (error) {
  console.error('[MAIN] Error initializing Telegram SDK:', error)
}

// Render the App
renderApp()
