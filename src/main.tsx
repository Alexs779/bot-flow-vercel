import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

const renderApp = () => {
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

// Check if the Telegram WebApp is available
if (window.Telegram?.WebApp) {
  // Wait for the WebApp to be ready before rendering the app
  window.Telegram.WebApp.ready()
  renderApp()
} else {
  // If the WebApp is not available, render the app immediately
  // This is useful for development outside of the Telegram environment
  console.warn("Telegram WebApp is not available. Running in standard browser mode.")
  renderApp()
}
