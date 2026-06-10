import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Wishlist() {
  const { user } = useAuth()

  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarWishlist()
  }, [user])

  const cargarWishlist = async () => {
    if (!user?.username) return

    setLoading(true)

    const guardados = JSON.parse(
      localStorage.getItem(
        `wishlist_${user.username}`
      ) || '[]'
    )

    const actualizados = await Promise.all(
      guardados.map(async (juego) => {
        try {
          const res = await fetch(
            `https://www.cheapshark.com/api/1.0/games?id=${juego.gameID}`
          )

          const data = await res.json()

          const precioActual =
            parseFloat(data.cheapestPrice?.price) ||
            parseFloat(data.cheapest) ||
            juego.precioGuardado

          return {
            ...juego,
            precioActual,
            bajoDePrecio:
              precioActual < juego.precioGuardado,
            ahorro:
              (
                juego.precioGuardado -
                precioActual
              ).toFixed(2)
          }
        } catch {
          return {
            ...juego,
            precioActual: juego.precioGuardado,
            bajoDePrecio: false,
            ahorro: 0
          }
        }
      })
    )

    setWishlist(actualizados)
    setLoading(false)
  }

  const eliminarDeseo = (gameID) => {
    const nuevaLista = wishlist.filter(
      j => j.gameID !== gameID
    )

    setWishlist(nuevaLista)

    localStorage.setItem(
      `wishlist_${user.username}`,
      JSON.stringify(nuevaLista)
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          💝 Lista de Deseos
        </h1>

        <p className="text-gray-400 mt-2">
          Seguimiento automático de precios
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">
          Consultando ofertas...
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">
            💝
          </p>

          <p className="text-gray-400">
            No tienes juegos en tu lista de deseos
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {wishlist.map(juego => (
            <div
              key={juego.gameID}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-white font-bold text-lg">
                    {juego.titulo}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Precio cuando lo guardaste:
                    {' '}
                    ${juego.precioGuardado}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Precio actual:
                    {' '}
                    ${juego.precioActual}
                  </p>
                </div>

                <button
                  onClick={() =>
                    eliminarDeseo(juego.gameID)
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  ❌
                </button>

              </div>

              <div className="mt-4">

                {juego.bajoDePrecio ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">

                    <p className="text-green-400 font-bold">
                      🔥 Bajó de precio
                    </p>

                    <p className="text-green-300 text-sm mt-1">
                      Ahorras ${juego.ahorro}
                    </p>

                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">

                    <p className="text-yellow-400 font-bold">
                      ⏳ Sin cambios
                    </p>

                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}