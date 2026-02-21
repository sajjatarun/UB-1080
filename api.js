import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const submitComplaint = (data) => api.post('/complaints/submit', data)
export const getComplaints = (params) => api.get('/complaints', { params })
export const getComplaint = (ticketId) => api.get(`/complaints/${ticketId}`)
export const updateStatus = (ticketId, status) => api.patch(`/complaints/${ticketId}/status`, { status })
export const getStats = () => api.get('/stats')

export default api
