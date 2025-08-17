import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Conversation from './Conversation.jsx'
import Generate from './Generate.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/conversation" element={<Conversation />} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
