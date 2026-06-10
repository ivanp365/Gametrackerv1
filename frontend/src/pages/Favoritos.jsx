import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState(() => {
    const saved = localStorage.getItem('favoritos')
    return saved ? JSON.parse(saved) : []
  })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const eliminarFavorito = (id) => {
    const nuevos = favoritos.filter(f => f.id !== id)
    setFavoritos(nuevos)
    localStorage.setItem('favoritos', JSON.stringify(nuevos))
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Nexus<span className="text-purple-500">GT</span></h1>
          <p className="text-gray-500 text-xs mt-1">Game Tracker</p>
        </div>
       <nav className="flex-1 p-4 space-y-1">
<a href="/favoritos" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">⭐ Favoritos</a>  <a href="/juegos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🕹️ Explorar Juegos</a>
  <a href="/joyas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">💎 Joyas Ocultas</a>
  <a href="/ofertas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🔥 Ofertas</a>
  <a href="/biblioteca" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">📚 Mi Biblioteca</a>
  <a href="/tickets" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎫 Mis Tickets</a>
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
          <h2 className="text-2xl font-bold text-white">Mis Favoritos ⭐</h2>
          <p className="text-gray-400 mt-1">{favoritos.length} juegos en tu biblioteca</p>
        </div>

        {favoritos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">⭐</p>
            <p>No tienes juegos favoritos aún</p>
            <p className="text-sm mt-1">Ve a Explorar Juegos y guarda los que te gusten</p>
            <a href="/juegos" className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition text-sm">
              Explorar Juegos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoritos.map(juego => (
              <div key={juego.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition group">
                <div className="relative">
                  <img
                    src={juego.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={juego.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={() => eliminarFavorito(juego.id)}
                    className="absolute top-2 right-2 text-xl"
                  >
                    ⭐
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm truncate">{juego.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{juego.released?.slice(0, 4) || 'N/A'}</span>
                    {juego.metacritic && (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${juego.metacritic >= 75 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {juego.metacritic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarFavorito(juego.id)}
                    className="w-full mt-3 text-red-400 hover:bg-red-400/10 rounded-lg py-1 text-xs transition"
                  >
                    Quitar de favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}