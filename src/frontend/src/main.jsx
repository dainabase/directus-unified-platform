import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// CSS Imports
import './index.css'                    // Base styles
import './styles/design-system.css'     // Apple Premium Design System tokens

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)