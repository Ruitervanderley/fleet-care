import api from './api'
import { DEFAULT_PAGINATION } from '../config/constants'

export const equipmentService = {
  /**
   * Lista equipamentos com suporte a busca e paginação
   * @param {Object} params Parâmetros de busca
   * @param {string} params.search Termo de busca
   * @param {string} params.tenantId ID do tenant
   * @param {boolean} params.active Filtrar por ativos
   * @param {number} params.page Número da página
   * @param {number} params.pageSize Tamanho da página
   * @param {AbortSignal} params.signal Sinal para cancelar a requisição
   */
  list: async (params = {}) => {
    const {
      search,
      tenantId,
      active,
      page = 1,
      pageSize = DEFAULT_PAGINATION.pageSize,
      signal
    } = params

    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (tenantId) queryParams.append('tenantId', tenantId)
    if (active !== undefined) queryParams.append('active', active)
    queryParams.append('page', page)
    queryParams.append('pageSize', pageSize)

    const response = await api.get(`/equipment?${queryParams.toString()}`, { signal })
    
    // Mapear para o formato esperado pelo react-select
    const options = (response.data.items || response.data).map(equipment => ({
      value: equipment.id,
      label: equipment.nome || equipment.name || equipment.tag
    }))

    return {
      options,
      hasMore: response.data.hasMore,
      total: response.data.total
    }
  },

  /**
   * Busca um equipamento por ID
   */
  getById: async (id) => {
    const response = await api.get(`/equipment/${id}`)
    return response.data
  }
}

export default equipmentService