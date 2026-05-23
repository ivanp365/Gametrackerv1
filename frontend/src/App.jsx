import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Juegos from './pages/Juegos'
import Tickets from './pages/Tickets'
import Favoritos from './pages/Favoritos'
import ProtectedRoute from './components/ProtectedRoute'
import Admin from './pages/Admin'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/juegos" element={<ProtectedRoute><Juegos /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App