import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init } from '@tma.js/sdk-react'
import './index.css'
import App from './App.tsx'

// Initialize the Telegram Mini Apps SDK
init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
