// MATC Admin Panel - Nuclear Fix Entry Point
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Ensure API is loaded before app starts
import './config/api.ts'

console.log('🚀 MATC Admin Panel starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

console.log('✅ MATC Admin Panel loaded successfully');
