export const API_BASE = 'http://localhost:8000'

export const DATE_FORMATS = {
  default: 'dd/MM/yyyy',
  withTime: 'dd/MM/yyyy HH:mm',
  short: 'dd/MM',
  monthYear: 'MM/yyyy'
}

export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'preventiva',
  CORRECTIVE: 'corretiva',
  PREDICTIVE: 'preditiva'
}

export const EQUIPMENT_STATUS = {
  ACTIVE: 'ativo',
  MAINTENANCE: 'manutenção',
  INACTIVE: 'inativo',
  CRITICAL: 'crítico'
}

export const PRIORITY_LEVELS = {
  HIGH: 'alta',
  MEDIUM: 'média',
  LOW: 'baixa'
}

export const TIME_RANGES = {
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  YEAR: '365d'
}

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area'
}

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
}

export const THEME_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
}

export const DEFAULT_PAGINATION = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100]
}

export const LOCAL_STORAGE_KEYS = {
  theme: 'fleet-care-theme',
  userPreferences: 'fleet-care-preferences',
  authToken: 'fleet-care-token'
}

export const ERROR_MESSAGES = {
  general: 'Ocorreu um erro. Tente novamente.',
  network: 'Erro de conexão. Verifique sua internet.',
  auth: 'Erro de autenticação. Faça login novamente.',
  notFound: 'Recurso não encontrado.',
  validation: 'Dados inválidos. Verifique os campos.'
}

export const SUCCESS_MESSAGES = {
  save: 'Dados salvos com sucesso!',
  update: 'Atualização realizada com sucesso!',
  delete: 'Item excluído com sucesso!',
  import: 'Importação concluída com sucesso!',
  export: 'Exportação concluída com sucesso!'
} 