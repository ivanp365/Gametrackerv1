import axios from 'axios'

const api = axios.create({
baseURL: 'http://34.227.95.16:8080/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const ticketService = {
  listar: () => api.get('/tickets'),
  crear: (data) => api.post('/tickets', data),
  actualizar: (id, data) => api.put(`/tickets/${id}`, data),
  eliminar: (id) => api.delete(`/tickets/${id}`),
  cambiarEstado: (id, estado) => api.patch(`/tickets/${id}/estado?estado=${estado}`),
responder: (id, respuesta, estado) => api.put(`/tickets/${id}/responder?respuesta=${encodeURIComponent(respuesta)}&estado=${estado}`),}

export default api