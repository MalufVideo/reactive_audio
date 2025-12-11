import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { AdminPage } from './pages/AdminPage'
import { BroadcastPage } from './pages/BroadcastPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/broadcast" element={<BroadcastPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
