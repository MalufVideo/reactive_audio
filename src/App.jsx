import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ViewerPage } from './pages/ViewerPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ViewerPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
