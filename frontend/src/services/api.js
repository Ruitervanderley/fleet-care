import axios from 'axios'
import { API_BASE, ERROR_MESSAGES } from '../config/constants'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.general
    console.error('API Error:', error)
    return Promise.reject({ message: errorMessage, originalError: error })
  }
)

// Serviços de Equipamentos
export const equipmentService = {
  getAll: () => api.get('/equipment'),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  updateInterval: (id, interval) => api.put(`/equipment/${id}/interval`, { interval }),
  getHistory: (id) => api.get(`/equipment/${id}/history`)
}

// Serviços de Manutenção
export const maintenanceService = {
  getAll: () => api.get('/maintenance'),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  getSchedule: () => api.get('/maintenance/schedule'),
  getPredictions: () => api.get('/maintenance/predictions')
}

// Serviços de Dashboard
export const dashboardService = {
  getSummary: () => api.get('/dashboard'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getMetrics: (timeRange) => api.get('/dashboard/metrics', { params: { timeRange } }),
  getCharts: (type) => api.get('/dashboard/charts', { params: { type } })
}

// Serviços de Relatórios
export const reportService = {
  generate: (type, filters) => api.post('/reports/generate', { type, filters }),
  export: (format, data) => api.post('/reports/export', { format, data }),
  getTemplates: () => api.get('/reports/templates'),
  saveTemplate: (template) => api.post('/reports/templates', template)
}

// Serviços de Configuração
export const configService = {
  getSettings: () => api.get('/config'),
  updateSettings: (settings) => api.put('/config', settings),
  importData: () => api.post('/import'),
  exportData: () => api.get('/export', { responseType: 'blob' })
}

// Serviços de Análise Preditiva
export const predictiveService = {
  getFailurePredictions: () => api.get('/predictive/failures'),
  getCostOptimization: () => api.get('/predictive/costs'),
  getMaintenanceSchedule: () => api.get('/predictive/schedule'),
  getComponentHealth: (equipmentId) => api.get(`/predictive/health/${equipmentId}`)
}

// Serviços de Fornecedores
export const supplierService = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`)
}

// Serviços de Usuários
export const userService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences)
}

// Serviços de Notificações
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (settings) => api.put('/notifications/settings', settings)
}

export default api 