import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Juegos from './pages/Juegos'
import Tickets from './pages/Tickets'
import Favoritos from './pages/Favoritos'
import ProtectedRoute from './components/ProtectedRoute'
import Admin from './pages/Admin'
import JoyasOcultas from './pages/JoyasOcultas'
import Ofertas from './pages/Ofertas'
import Biblioteca from './pages/Biblioteca'
import Wishlist from './pages/Wishlist'

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
        <Route path="/joyas" element={<ProtectedRoute><JoyasOcultas /></ProtectedRoute>} /> 
        <Route path="/ofertas" element={<ProtectedRoute><Ofertas /></ProtectedRoute>} />
        <Route path="/biblioteca" element={<ProtectedRoute><Biblioteca /></ProtectedRoute>} />
        <Route
  path="/wishlist"
  element={<Wishlist />}
/>


      </Routes>
    </BrowserRouter>
  )
}

export default App