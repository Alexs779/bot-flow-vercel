import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

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
