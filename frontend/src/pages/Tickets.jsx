import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ticketService } from '../services/api'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descripcion: '', prioridad: 'MEDIA', categoria: '' })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const cargarTickets = async () => {
    try {
      const res = await ticketService.listar()
      setTickets(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarTickets() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await ticketService.crear(form)
      setForm({ titulo: '', descripcion: '', prioridad: 'MEDIA', categoria: '' })
      setShowForm(false)
      cargarTickets()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este ticket?')) {
      await ticketService.eliminar(id)
      cargarTickets()
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const coloresPrioridad = {
    BAJA: 'text-green-400 bg-green-400/10',
    MEDIA: 'text-yellow-400 bg-yellow-400/10',
    ALTA: 'text-orange-400 bg-orange-400/10',
    CRITICA: 'text-red-400 bg-red-400/10',
  }

  const coloresEstado = {
    ABIERTO: 'text-blue-400 bg-blue-400/10',
    EN_PROGRESO: 'text-yellow-400 bg-yellow-400/10',
    RESUELTO: 'text-green-400 bg-green-400/10',
    CERRADO: 'text-gray-400 bg-gray-400/10',
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
          <a href="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎮 Dashboard</a>
          <a href="/juegos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🕹️ Explorar Juegos</a>
          <a href="/tickets" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">🎫 Mis Tickets</a>
          <a href="/favoritos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">⭐ Favoritos</a>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Mis Tickets 🎫</h2>
            <p className="text-gray-400 mt-1">Gestiona tus solicitudes de soporte</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            + Nuevo Ticket
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Crear Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Título del ticket"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              />
              <textarea
                placeholder="Descripción detallada"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 h-24 resize-none"
              />
              <div className="flex gap-3">
                <select
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                >
                  <option value="BAJA">Prioridad Baja</option>
                  <option value="MEDIA">Prioridad Media</option>
                  <option value="ALTA">Prioridad Alta</option>
                  <option value="CRITICA">Prioridad Crítica</option>
                </select>
                <select
  value={form.categoria}
  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
>
  <option value="">Selecciona categoría</option>
  <option value="Bug">🐛 Bug</option>
  <option value="Soporte">🛠️ Soporte</option>
  <option value="Cuenta">👤 Cuenta</option>
  <option value="Juegos">🎮 Juegos</option>
  <option value="Pagos">💳 Pagos</option>
  <option value="Otro">📌 Otro</option>
</select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
                  Crear Ticket
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white px-6 py-2 rounded-lg transition">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de tickets */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-20 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🎫</p>
            <p>No tienes tickets aún</p>
            <p className="text-sm mt-1">Crea uno con el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{ticket.titulo}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${coloresPrioridad[ticket.prioridad]}`}>
                        {ticket.prioridad}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${coloresEstado[ticket.estado]}`}>
                        {ticket.estado}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{ticket.descripcion}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      {ticket.categoria && `📁 ${ticket.categoria} • `}
                      👤 {ticket.usuario?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEliminar(ticket.id)}
                    className="text-gray-600 hover:text-red-400 transition ml-4"
                  >
                    🗑️
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