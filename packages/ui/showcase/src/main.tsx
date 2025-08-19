import React from 'react'
import ReactDOM from 'react-dom/client'
import { ShowcaseApp } from './showcase-app'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShowcaseApp />
  </React.StrictMode>,
)