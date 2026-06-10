import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ticketService } from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [favoritos, setFavoritos] = useState([])

useEffect(() => {
  const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
  setFavoritos(favs)
  ticketService.listar().then(res => setTickets(res.data)).catch(() => {})
}, [])
  const handleLogout = () => { logout(); navigate('/login') }

const ticketsAbiertos = tickets.filter(t => t.estado === 'ABIERTO').length
const ticketsEnProgreso = tickets.filter(t => t.estado === 'EN_PROGRESO').length
const ticketsResueltos = tickets.filter(t => t.estado === 'RESUELTO').length
const ticketsCerrados = tickets.filter(t => t.estado === 'CERRADO').length
  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Nexus<span className="text-purple-500">GT</span></h1>
          <p className="text-gray-500 text-xs mt-1">Game Tracker</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
<a href="/dashboard" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">🎮 Dashboard</a>  <a href="/juegos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🕹️ Explorar Juegos</a>
  <a href="/joyas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">💎 Joyas Ocultas</a>
  <a href="/ofertas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🔥 Ofertas</a>
  <a href="/biblioteca" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">📚 Mi Biblioteca</a>
  <a href="/tickets" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎫 Mis Tickets</a>
  
  <a
    href="/wishlist"
    className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition"
  >
    💝 Lista de Deseos
  </a>
  <a href="/favoritos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">⭐ Favoritos</a>
  {user?.role === 'ROLE_ADMIN' && (
    <a href="/admin" className="flex items-center gap-3 text-red-400 hover:text-white hover:bg-red-400/10 rounded-lg px-4 py-3 text-sm transition">⚙️ Panel Admin</a>
  )}
</nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-gray-500 text-xs">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg px-4 py-2 text-sm transition text-left">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Bienvenido, {user?.username} 👋</h2>
          <p className="text-gray-400 mt-1">Este es tu panel de control</p>
        </div>

       {/* Cards con datos reales */}
{user?.role === 'ROLE_ADMIN' ? (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Juegos Favoritos</p>
      <p className="text-3xl font-bold text-white mt-2">{favoritos.length}</p>
      <p className="text-purple-400 text-xs mt-1">⭐ En tu biblioteca</p>
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Tickets Abiertos</p>
      <p className="text-3xl font-bold text-white mt-2">{ticketsAbiertos}</p>
      <p className="text-blue-400 text-xs mt-1">🎫 Sin atender</p>
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">En Progreso</p>
      <p className="text-3xl font-bold text-white mt-2">{ticketsEnProgreso}</p>
      <p className="text-yellow-400 text-xs mt-1">⚙️ Siendo atendidos</p>
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Resueltos</p>
      <p className="text-3xl font-bold text-white mt-2">{ticketsResueltos}</p>
      <p className="text-green-400 text-xs mt-1">✅ Completados</p>
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Mis Favoritos</p>
      <p className="text-3xl font-bold text-white mt-2">{favoritos.length}</p>
      <p className="text-purple-400 text-xs mt-1">⭐ En tu biblioteca</p>
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Mis Tickets Abiertos</p>
      <p className="text-3xl font-bold text-white mt-2">{ticketsAbiertos}</p>
      <p className="text-blue-400 text-xs mt-1">🎫 Esperando respuesta</p>
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">Tickets Resueltos</p>
      <p className="text-3xl font-bold text-white mt-2">{ticketsResueltos}</p>
      <p className="text-green-400 text-xs mt-1">✅ Solucionados</p>
    </div>
  </div>
)}
        {/* Últimos tickets */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Últimos Tickets</h3>
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay tickets aún</p>
          ) : (
            <div className="space-y-2">
              {tickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <span className="text-white text-sm">{ticket.titulo}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${ticket.estado === 'ABIERTO' ? 'bg-blue-400/10 text-blue-400' : 'bg-green-400/10 text-green-400'}`}>
                    {ticket.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
          <a href="/tickets" className="text-purple-400 text-sm mt-3 block hover:text-purple-300">
            Ver todos →
          </a>
        </div>

        {/* Últimos favoritos */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Últimos Favoritos</h3>
          {favoritos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay favoritos aún</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {favoritos.slice(0, 4).map(juego => (
                <div key={juego.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                  <img src={juego.background_image} className="w-8 h-8 rounded object-cover" />
                  <span className="text-white text-xs">{juego.name}</span>
                </div>
              ))}
            </div>
          )}
          <a href="/favoritos" className="text-purple-400 text-sm mt-3 block hover:text-purple-300">
            Ver todos →
          </a>
        </div>
      </div>
    </div>
  )
}