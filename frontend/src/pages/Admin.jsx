import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ticketService } from '../services/api'
import toast from 'react-hot-toast'

function ResponderTicket({ ticket, onResponder }) {
  const [open, setOpen] = useState(false)
  const [respuesta, setRespuesta] = useState(ticket.respuesta || '')
  const [estado, setEstado] = useState(ticket.estado)
  const [loading, setLoading] = useState(false)

  const handleResponder = async () => {
  setLoading(true)
  try {
    await ticketService.responder(ticket.id, respuesta, estado)
    setOpen(false)
    onResponder()
    toast.success('💬 Respuesta enviada exitosamente')
  } catch (err) {
    toast.error('❌ Error al enviar respuesta')
  } finally {
    setLoading(false)
  }
}

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs rounded-lg px-2 py-1 transition"
      >
        💬 {ticket.respuesta ? 'Editar respuesta' : 'Responder'}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-purple-500 h-20 resize-none"
          />
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1"
          >
            <option value="ABIERTO">Abierto</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="RESUELTO">Resuelto</option>
            <option value="CERRADO">Cerrado</option>
          </select>
          <button
            onClick={handleResponder}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg py-1 transition"
          >
            {loading ? 'Enviando...' : 'Enviar respuesta'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'ROLE_ADMIN') {
      navigate('/dashboard')
    }
    cargarTickets()
  }, [])

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

  const cambiarEstado = async (id, estado) => {
    try {
      await ticketService.cambiarEstado(id, estado)
      cargarTickets()
    } catch (err) {
      console.error(err)
    }
  }

  const eliminar = async (id) => {
    if (confirm('¿Eliminar ticket?')) {
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
          <p className="text-gray-500 text-xs mt-1">Panel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎮 Dashboard</a>
          <a href="/admin" className="flex items-center gap-3 text-white bg-purple-600/20 border border-purple-500/30 rounded-lg px-4 py-3 text-sm">⚙️ Panel Admin</a>
          <a href="/juegos" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🕹️ Explorar Juegos</a>
          <a href="/tickets" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-3 text-sm transition">🎫 Tickets</a>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-red-400 text-xs">{user?.role}</p>
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
          <h2 className="text-2xl font-bold text-white">Panel de Administración ⚙️</h2>
          <p className="text-gray-400 mt-1">Gestiona todos los tickets del sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'].map(estado => (
            <div key={estado} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs">{estado.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {tickets.filter(t => t.estado === estado).length}
              </p>
            </div>
          ))}
        </div>

        {/* Tabla de tickets */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl h-16 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🎫</p>
            <p>No hay tickets en el sistema</p>
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
                      👤 {ticket.usuario?.username} • 📁 {ticket.categoria}
                    </p>
                  </div>

                  {/* Acciones */}
<div className="flex flex-col gap-2 ml-4 min-w-48">
  <select
    value={ticket.estado}
    onChange={(e) => cambiarEstado(ticket.id, e.target.value)}
    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500"
  >
    <option value="ABIERTO">Abierto</option>
    <option value="EN_PROGRESO">En Progreso</option>
    <option value="RESUELTO">Resuelto</option>
    <option value="CERRADO">Cerrado</option>
  </select>
  <ResponderTicket ticket={ticket} onResponder={cargarTickets} />
  <button
    onClick={() => eliminar(ticket.id)}
    className="text-gray-600 hover:text-red-400 transition text-xs"
  >
    🗑️ Eliminar
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}