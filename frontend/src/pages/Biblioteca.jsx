import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ESTADOS = {
  jugando: { label: 'Jugando', emoji: '🎮', color: 'text-green-400 bg-green-400/10 border-green-500/30' },
  completado: { label: 'Completado', emoji: '✅', color: 'text-blue-400 bg-blue-400/10 border-blue-500/30' },
  porJugar: { label: 'Por Jugar', emoji: '⏳', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30' },
  abandonado: { label: 'Abandonado', emoji: '❌', color: 'text-red-400 bg-red-400/10 border-red-500/30' },
}

export default function Biblioteca() {
  const [biblioteca, setBiblioteca] = useState({})
const [favoritos, setFavoritos] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
  if (!user?.username) return

  const bibliotecaGuardada = JSON.parse(
    localStorage.getItem(
      `biblioteca_${user.username}`
    ) || '{}'
  )

  const favoritosGuardados = JSON.parse(
    localStorage.getItem(
      `favoritos_${user.username}`
    ) || '[]'
  )

  setBiblioteca(bibliotecaGuardada)
  setFavoritos(favoritosGuardados)

}, [user])

  const handleLogout = () => { logout(); navigate('/login') }

  const cambiarEstado = (juegoId, estado) => {
    const nueva = { ...biblioteca }
    if (nueva[juegoId] === estado) {
      delete nueva[juegoId]
    } else {
      nueva[juegoId] = estado
    }
    setBiblioteca(nueva)
localStorage.setItem(
  `biblioteca_${user.username}`,
  JSON.stringify(nueva)
)  }

  const juegosFiltrados = favoritos.filter(j => {
    if (filtro === 'todos') return true
    if (filtro === 'sinEstado') return !biblioteca[j.id]
    return biblioteca[j.id] === filtro
  })

  const conteos = {
    todos: favoritos.length,
    jugando: favoritos.filter(j => biblioteca[j.id] === 'jugando').length,
    completado: favoritos.filter(j => biblioteca[j.id] === 'completado').length,
    porJugar: favoritos.filter(j => biblioteca[j.id] === 'porJugar').length,
    abandonado: favoritos.filter(j => biblioteca[j.id] === 'abandonado').length,
  }

  const porcentajeCompletado = favoritos.length > 0
    ? Math.round((conteos.completado / favoritos.length) * 100)
    : 0

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
          <a href="/joyas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">💎 Joyas Ocultas</a>
          <a href="/ofertas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🔥 Ofertas</a>
          <a href="/biblioteca" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">📚 Mi Biblioteca</a>
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
          <h2 className="text-2xl font-bold text-white">Mi Biblioteca 📚</h2>
          <p className="text-gray-400 mt-1">Organiza tus juegos por estado</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(ESTADOS).map(([key, val]) => (
            <div key={key} className={`bg-gray-900 border rounded-xl p-4 ${val.color}`}>
              <p className="text-xs opacity-70">{val.emoji} {val.label}</p>
              <p className="text-2xl font-bold mt-1">{conteos[key]}</p>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-white text-sm font-medium">Progreso de tu biblioteca</span>
            <span className="text-purple-400 font-bold">{porcentajeCompletado}% completado</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${porcentajeCompletado}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">{conteos.completado} de {favoritos.length} juegos completados</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'todos', label: `Todos (${conteos.todos})` },
            { key: 'jugando', label: `🎮 Jugando (${conteos.jugando})` },
            { key: 'completado', label: `✅ Completado (${conteos.completado})` },
            { key: 'porJugar', label: `⏳ Por Jugar (${conteos.porJugar})` },
            { key: 'abandonado', label: `❌ Abandonado (${conteos.abandonado})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filtro === f.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de juegos */}
        {favoritos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📚</p>
            <p>No tienes juegos en favoritos aún</p>
            <a href="/juegos" className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm transition">
              Explorar Juegos
            </a>
          </div>
        ) : juegosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p>No hay juegos con ese estado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {juegosFiltrados.map(juego => {
              const estadoActual = biblioteca[juego.id]
              const estadoInfo = estadoActual ? ESTADOS[estadoActual] : null
              return (
                <div key={juego.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
                  <div className="relative">
                    <img
                      src={juego.background_image || 'https://via.placeholder.com/300x200'}
                      alt={juego.name}
                      className="w-full h-36 object-cover"
                    />
                    {estadoInfo && (
                      <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full border font-medium ${estadoInfo.color}`}>
                        {estadoInfo.emoji} {estadoInfo.label}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm truncate mb-3">{juego.name}</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(ESTADOS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => cambiarEstado(juego.id, key)}
                          className={`text-xs py-1 px-2 rounded-lg transition border ${
                            estadoActual === key
                              ? val.color
                              : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'
                          }`}
                        >
                          {val.emoji} {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}