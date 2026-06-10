import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_KEY = '50851083b7cb42228b48add813f8d0eb'
const BASE_URL = 'https://api.rawg.io/api'

export default function Juegos() {
  const [juegos, setJuegos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [genero, setGenero] = useState('')
  const [preciosCheapShark, setPreciosCheapShark] = useState({}) // Guarda { 'Title': { price, gameID } }
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [favoritos, setFavoritos] = useState([])

  const fetchJuegos = async (query = '', generoFiltro = '') => {
    setLoading(true)
    try {
      let url = `${BASE_URL}/games?key=${API_KEY}&page_size=20`
      if (query) url += `&search=${encodeURIComponent(query)}`
      if (generoFiltro) url += `&genres=${generoFiltro}`
      
      const res = await fetch(url)
      const data = await res.json()
      const juegosObtenidos = data.results || []
      setJuegos(juegosObtenidos)

      // Iniciar la búsqueda de precios en CheapShark de forma paralela
      buscarPreciosCheapShark(juegosObtenidos)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Busca los precios correspondientes en la API de CheapShark usando el título de RAWG
  const buscarPreciosCheapShark = async (listaJuegos) => {
    const mapaPrecios = {}
    
    // Ejecutamos las peticiones en paralelo para no bloquear el renderizado
    await Promise.all(
      listaJuegos.map(async (juego) => {
        try {
          const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(juego.name)}&pageSize=1`)
          const data = await res.json()
          if (data && data.length > 0) {
            mapaPrecios[juego.id] = {
              precio: parseFloat(data[0].salePrice).toFixed(2),
              gameID: data[0].gameID
            }
          }
        } catch (error) {
          console.error(`Error buscando precio para ${juego.name}:`, error)
        }
      })
    )
    
    setPreciosCheapShark((prev) => ({ ...prev, ...mapaPrecios }))
  }

  useEffect(() => {
    fetchJuegos()
  }, [])

  useEffect(() => {
    if (user?.username) {
      const saved = localStorage.getItem(`favoritos_${user.username}`)
      setFavoritos(saved ? JSON.parse(saved) : [])
    }
  }, [user])

  const handleBuscar = (e) => {
    e.preventDefault()
    fetchJuegos(busqueda, genero)
  }

  const toggleFavorito = (juego) => {
    const existe = favoritos.find(f => f.id === juego.id)
    let nuevos
    if (existe) {
      nuevos = favoritos.filter(f => f.id !== juego.id)
    } else {
      nuevos = [...favoritos, juego]
    }
    setFavoritos(nuevos)
    if (user?.username) {
      localStorage.setItem(`favoritos_${user.username}`, JSON.stringify(nuevos))
    }
  }

  const agregarWishlist = (juego) => {
    if (!user?.username) return

    const datosCheapShark = preciosCheapShark[juego.id]

    if (!datosCheapShark) {
      alert('No se encontró una oferta activa en CheapShark para registrar el precio base de este juego.')
      return
    }

    const wishlist = JSON.parse(
      localStorage.getItem(`wishlist_${user.username}`) || '[]'
    )

    const existe = wishlist.find(item => item.gameID === datosCheapShark.gameID)

    if (existe) {
      alert('Ya está en tu lista de deseos')
      return
    }

    wishlist.push({
      gameID: datosCheapShark.gameID,
      titulo: juego.name,
      precioGuardado: parseFloat(datosCheapShark.precio),
      fechaGuardado: new Date().toISOString()
    })

    localStorage.setItem(
      `wishlist_${user.username}`,
      JSON.stringify(wishlist)
    )

    alert('¡Agregado a Lista de Deseos! 💝 Mantenlo bajo la mira.')
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
          <a href="/juegos" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">🕹️ Explorar Juegos</a>
          <a href="/joyas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">💎 Joyas Ocultas</a>
          <a href="/ofertas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🔥 Ofertas</a>
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
          <h2 className="text-2xl font-bold text-white">Explorar Juegos 🕹️</h2>
          <p className="text-gray-400 mt-1">Busca y guarda tus juegos favoritos con precios en tiempo real</p>
        </div>

        {/* Buscador */}
        <form onSubmit={handleBuscar} className="flex gap-3 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar juego..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
          />
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          >
            <option value="">Todos los géneros</option>
            <option value="action">Acción</option>
            <option value="rpg">RPG</option>
            <option value="shooter">Shooter</option>
            <option value="adventure">Aventura</option>
            <option value="strategy">Estrategia</option>
            <option value="sports">Deportes</option>
          </select>
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-medium">
            Buscar
          </button>
        </form>

        {/* Grid de juegos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-64 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {juegos.map(juego => {
              const infoPrecio = preciosCheapShark[juego.id];
              return (
                <div key={juego.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition group flex flex-col justify-between">
                  <div>
                    <div className="relative">
                      <img
                        src={juego.background_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={juego.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorito(juego)}
                        className="absolute top-2 right-2 text-2xl z-10 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition"
                      >
                        {esFavorito(juego.id) ? '⭐' : '☆'}
                      </button>
                    </div>
                    
                    <div className="p-4 pb-0">
                      <h3 className="text-white font-medium text-sm truncate">{juego.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-500 text-xs">{juego.released?.slice(0, 4) || 'N/A'}</span>
                        {juego.metacritic && (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${juego.metacritic >= 75 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {juego.metacritic}
                          </span>
                        )}
                      </div>

                      {/* RENDERIZADO DEL PRECIO EN TIEMPO REAL */}
                      <div className="mt-3 pt-2 border-t border-gray-800/60">
                        {infoPrecio ? (
                          <p className="text-green-400 font-semibold text-xs flex items-center gap-1">
                            💰 Desde <span className="text-sm font-bold">${infoPrecio.precio} USD</span>
                          </p>
                        ) : (
                          <p className="text-gray-500 text-xs italic">Precios no disponibles</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN */}
                  <div className="p-4 pt-3 flex gap-2">
                    <button
                      onClick={() => toggleFavorito(juego)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                        esFavorito(juego.id) 
                          ? 'bg-yellow-500 text-gray-950 font-bold hover:bg-yellow-600' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {esFavorito(juego.id) ? '⭐ Quitar' : '⭐ Favorito'}
                    </button>
                    
                    <button
                      onClick={() => agregarWishlist(juego)}
                      disabled={!infoPrecio}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                        infoPrecio 
                          ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600 hover:text-white' 
                          : 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      💝 Deseos
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}