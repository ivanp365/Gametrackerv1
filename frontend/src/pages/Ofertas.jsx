import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Diccionario de tiendas actualizado de CheapShark para evitar los "Tienda ID"
const tiendas = {
  '1': 'Steam', '2': 'GamersGate', '3': 'GreenManGaming', '4': 'Amazon',
  '5': 'GameStop', '6': 'Direct2Drive', '7': 'GOG', '8': 'Origin',
  '9': 'Get Games', '10': 'Shiny Loot', '11': 'Humble Store', '12': 'Desura',
  '13': 'Uplay', '14': 'IndieGameStand', '15': 'Fanatical', '16': 'Gamesrocket',
  '17': 'Games Republic', '18': 'SilaGames', '19': 'Playfield', '20': 'ImperialGames',
  '21': 'WinGameStore', '22': 'FunstockDigital', '23': 'IndieGala', '24': 'GamersFrontier',
  '25': 'Epic Games', '26': 'Bravissimo', '27': 'Gamesplanet', '28': 'Xsolla',
  '29': 'Nintendo eShop', '30': 'PlayStation Store', '31': 'Xbox Store'
}

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null)
  const [analisis, setAnalisis] = useState(null)
  const [loadingAnalisis, setLoadingAnalisis] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchOfertas()
  }, [])

  const fetchOfertas = async (titulo = '') => {
    setLoading(true)
    try {
      const url = titulo
        ? `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(titulo)}&pageSize=20&sortBy=Deal Rating`
        : `https://www.cheapshark.com/api/1.0/deals?pageSize=20&sortBy=Deal Rating&metacritic=70`
      const res = await fetch(url)
      const data = await res.json()
      setOfertas(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const analizarJuego = async (oferta) => {
    setJuegoSeleccionado(oferta)
    setLoadingAnalisis(true)
    setAnalisis(null)
    try {
      const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${oferta.gameID}`)
      const data = await res.json()

      const tituloReal = data.info?.title || oferta.title || 'Juego Desconocido'
      const precioActual = parseFloat(oferta.salePrice)
      const precioNormal = parseFloat(oferta.normalPrice)
      const precioMinimo = parseFloat(data.cheapestPrice?.price) || parseFloat(data.cheapest) || precioActual
      const descuentoActual = parseFloat(oferta.savings) || 0
      const metacritic = parseInt(oferta.metacriticScore) || 0

      let recomendacion = ''
      let color = ''
      let emoji = ''

      if (precioActual <= precioMinimo * 1.05) {
        recomendacion = `¡Precio histórico mínimo! Este es el mejor momento para comprarlo. Normalmente cuesta $${precioNormal} USD.`
        color = 'green'
        emoji = '🔥'
      } else if (descuentoActual >= 50) {
        recomendacion = `Gran oferta con ${Math.round(descuentoActual)}% de descuento. El precio mínimo histórico fue $${precioMinimo.toFixed(2)} USD. Vale la pena comprarlo ahora.`
        color = 'green'
        emoji = '✅'
      } else if (descuentoActual >= 25) {
        recomendacion = `Descuento moderado del ${Math.round(descuentoActual)}%. Históricamente ha bajado hasta $${precioMinimo.toFixed(2)} USD. Si no tienes urgencia, podrías esperar.`
        color = 'yellow'
        emoji = '⏳'
      } else {
        recomendacion = `Descuento bajo del ${Math.round(descuentoActual)}%. El precio mínimo histórico fue $${precioMinimo.toFixed(2)} USD. Te recomendamos esperar.`
        color = 'red'
        emoji = '⏸️'
      }

      const porcentajeMaxDescuento = precioNormal > 0
        ? (((precioNormal - precioMinimo) / precioNormal) * 100).toFixed(0)
        : 0

      const prediccion = porcentajeMaxDescuento > 50
        ? `Basado en el historial, este juego ha tenido descuentos de hasta ${porcentajeMaxDescuento}%. Es probable que vuelva a bajar en las próximas semanas.`
        : `Este juego raramente tiene descuentos grandes. El máximo histórico registrado fue ${porcentajeMaxDescuento}%.`

      const tiendasFormateadas = (data.deals || [])
        .filter(d => parseFloat(d.price) > 0)
        .slice(0, 5)
        .map(d => ({
          nombre: tiendas[d.storeID] || `Tienda ${d.storeID}`,
          precio: parseFloat(d.price).toFixed(2)
        }))

      setAnalisis({
        titulo: tituloReal,
        precioActual,
        precioNormal,
        precioMinimo,
        descuentoActual: Math.round(descuentoActual),
        metacritic,
        recomendacion,
        prediccion,
        color,
        emoji,
        tiendasFormateadas
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAnalisis(false)
    }
  }

  const agregarWishlist = () => {
    if (!analisis || !juegoSeleccionado) return

    const wishlist = JSON.parse(
      localStorage.getItem(`wishlist_${user?.username || 'invitado'}`) || '[]'
    )

    const existe = wishlist.find(item => item.titulo === analisis.titulo)

    if (existe) {
      alert('Ya está en tu lista de deseos')
      return
    }

    wishlist.push({
      gameID: juegoSeleccionado.gameID,
      titulo: analisis.titulo,
      precioGuardado: analisis.precioActual,
      fechaGuardado: new Date().toISOString()
    })

    localStorage.setItem(
      `wishlist_${user?.username || 'invitado'}`,
      JSON.stringify(wishlist)
    )

    alert('Juego agregado a Lista de Deseos 💝')
  }

  const ofertasPersonalizadas = ofertas.filter(o =>
    parseInt(o.metacriticScore) >= 70
  ).slice(0, 6)

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
          <a href="/joyas" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">💎 Joyas Ocultas</a>
          <a href="/ofertas" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">🔥 Ofertas</a>
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
          <h2 className="text-2xl font-bold text-white">Radar de Ofertas 🔥</h2>
          <p className="text-gray-400 mt-1">Compara precios y descubre si vale la pena comprar ahora</p>
        </div>

        {/* Radar personalizado */}
        {ofertasPersonalizadas.length > 0 && (
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <p className="text-purple-300 text-sm font-semibold mb-3">
              🎯 {user?.username}, hoy hay {ofertasPersonalizadas.length} ofertas destacadas para ti
            </p>
            <div className="flex gap-2 flex-wrap">
              {ofertasPersonalizadas.map(o => (
                <button
                  key={o.gameID}
                  onClick={() => analizarJuego(o)}
                  className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs px-3 py-1 rounded-full transition"
                >
                  {o.title || 'Ver Oferta'} — ${o.salePrice}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOfertas(busqueda)}
            placeholder="Buscar ofertas por nombre del juego..."
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => fetchOfertas(busqueda)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
          >
            Buscar
          </button>
          <button
            onClick={() => { setBusqueda(''); fetchOfertas('') }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition"
          >
            Ver todas
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de ofertas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Mejores ofertas del momento</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl h-20 animate-pulse border border-gray-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ofertas.map(oferta => (
                  <div
                    key={oferta.gameID}
                    onClick={() => analizarJuego(oferta)}
                    className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition hover:border-purple-500/50 ${juegoSeleccionado?.gameID === oferta.gameID ? 'border-purple-500' : 'border-gray-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      {oferta.thumb && (
                        <img
                          src={oferta.thumb}
                          alt={oferta.title}
                          className="w-16 h-10 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{oferta.title}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {tiendas[oferta.storeID] || `Tienda ${oferta.storeID}`}
                          {oferta.metacriticScore > 0 && ` • Metacritic: ${oferta.metacriticScore}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${oferta.salePrice}</p>
                        <p className="text-gray-500 text-xs line-through">${oferta.normalPrice}</p>
                        <p className="text-orange-400 text-xs font-bold">-{Math.round(parseFloat(oferta.savings))}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de analisis */}
          <div>
            <h3 className="text-white font-semibold mb-4">¿Vale la pena comprarlo? 🤔</h3>
            {!juegoSeleccionado ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
                <p className="text-4xl mb-3">👈</p>
                <p>Selecciona un juego de la lista para ver el análisis completo</p>
              </div>
            ) : loadingAnalisis ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <div className="animate-spin text-4xl mb-3">⚙️</div>
                <p className="text-gray-400">Analizando precio histórico...</p>
              </div>
            ) : analisis ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h4 className="text-white font-bold text-lg">{analisis.titulo}</h4>
                
                {/* Recomendacion principal */}
                <div className={`rounded-xl p-4 border ${
                  analisis.color === 'green' ? 'bg-green-500/10 border-green-500/30' :
                  analisis.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className={`font-bold text-lg mb-1 ${
                    analisis.color === 'green' ? 'text-green-400' :
                    analisis.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{analisis.emoji} {analisis.color === 'green' ? '¡Cómpralo ahora!' : analisis.color === 'yellow' ? 'Podrías esperar' : 'Espera mejor oferta'}</p>
                  <p className="text-gray-300 text-sm">{analisis.recomendacion}</p>
                </div>

                {/* BOTÓN WISHLIST INTELIGENTE */}
                <button
                  onClick={agregarWishlist}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  💝 Agregar a Lista de Deseos
                </button>

                {/* Precios */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Precio actual</p>
                    <p className="text-green-400 font-bold">${analisis.precioActual}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Precio normal</p>
                    <p className="text-white font-bold">${analisis.precioNormal}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Mínimo histórico</p>
                    <p className="text-purple-400 font-bold">${analisis.precioMinimo}</p>
                  </div>
                </div>

                {/* Descuento */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-xs">Descuento actual</span>
                    <span className="text-orange-400 font-bold text-xs">{analisis.descuentoActual}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(analisis.descuentoActual, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metacritic */}
                {analisis.metacritic > 0 && (
                  <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 text-xs">Metacritic</span>
                    <span className={`font-bold px-2 py-1 rounded text-sm ${
                      analisis.metacritic >= 80 ? 'bg-green-500/20 text-green-400' :
                      analisis.metacritic >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{analisis.metacritic}/100</span>
                  </div>
                )}

                {/* Prediccion */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-400 font-semibold text-sm mb-1">📈 Predicción de descuento</p>
                  <p className="text-gray-300 text-xs">{analisis.prediccion}</p>
                </div>

                {/* Tiendas */}
                {analisis.tiendasFormateadas?.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs mb-2">💰 Disponible en:</p>
                    <div className="space-y-2">
                      {analisis.tiendasFormateadas.map((t, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2">
                          <span className="text-white text-xs">{t.nombre}</span>
                          <span className="text-green-400 text-xs font-bold">${t.precio} USD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}