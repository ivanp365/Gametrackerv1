import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_KEY = '50851083b7cb42228b48add813f8d0eb'

export default function JoyasOcultas() {
  const [joyas, setJoyas] = useState([])
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState(() => {
    return JSON.parse(localStorage.getItem('favoritos') || '[]')
  })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJoyas()
  }, [])

  const fetchJoyas = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games?key=${API_KEY}&metacritic=85,100&page_size=40&ordering=-metacritic`
      )
      const data = await res.json()
      // Filtrar juegos con pocas reseñas = joyas ocultas
      const joyas = data.results.filter(j => j.ratings_count < 500)
      setJoyas(joyas)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorito = (juego) => {
    const existe = favoritos.find(f => f.id === juego.id)
    const nuevos = existe
      ? favoritos.filter(f => f.id !== juego.id)
      : [...favoritos, juego]
    setFavoritos(nuevos)
    localStorage.setItem('favoritos', JSON.stringify(nuevos))
  }

  const esFavorito = (id) => favoritos.some(f => f.id === id)
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Nexus<span className="text-purple-500">GT</span></h1>
          <p className="text-gray-500 text-xs mt-1">Game Tracker</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎮 Dashboard</a>
          <a href="/juegos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🕹️ Explorar Juegos</a>
          <a href="/joyas" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">💎 Joyas Ocultas</a>
          <a href="/ofertas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🔥 Ofertas</a>
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
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Joyas Ocultas 💎</h2>
          <p className="text-gray-400 mt-1">Juegos con Metacritic mayor a 85 que casi nadie conoce</p>
        </div>

        <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 mb-6">
          <p className="text-purple-300 text-sm">💡 <strong>¿Cómo funciona?</strong> Filtramos juegos con calificación crítica superior a 85/100 pero con menos de 500 reseñas de usuarios. Son obras de arte que están enterradas en internet.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-64 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : joyas.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">💎</p>
            <p>No se encontraron joyas ocultas en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {joyas.map(juego => (
              <div key={juego.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition group">
                <div className="relative">
                  <img
                    src={juego.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={juego.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => toggleFavorito(juego)}
                    className="absolute top-2 right-2 text-2xl z-10 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition"
                  >
                    {esFavorito(juego.id) ? '⭐' : '☆'}
                  </button>
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    💎 Joya
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm truncate">{juego.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{juego.released?.slice(0, 4) || 'N/A'}</span>
                    {juego.metacritic && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">
                        🏆 {juego.metacritic}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{juego.ratings_count} reseñas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}