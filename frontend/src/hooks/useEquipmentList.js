import useData from './useData'

export const useEquipmentList = () => {
  const { data, error, loading, refetch } = useData('/equipment', {
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  })

  const getFilteredEquipments = (filters = {}) => {
    if (!data) return []

    return data.filter(equipment => {
      const matchesSearch = !filters.search || 
        equipment.tag.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = !filters.status || 
        filters.status === 'all' || 
        equipment.status === filters.status

      const matchesType = !filters.type || 
        filters.type === 'all' || 
        equipment.type === filters.type

      return matchesSearch && matchesStatus && matchesType
    })
  }

  const getStatusSummary = () => {
    if (!data) return {
      active: 0,
      maintenance: 0,
      inactive: 0,
      total: 0
    }

    return data.reduce((acc, equipment) => {
      acc[equipment.status.toLowerCase()] = (acc[equipment.status.toLowerCase()] || 0) + 1
      acc.total++
      return acc
    }, { total: 0 })
  }

  const getMaintenanceNeeded = () => {
    if (!data) return []

    return data.filter(equipment => {
      if (!equipment.interval || equipment.interval === 0) return false
      const usage = equipment.atual - equipment.ultima_manut
      return usage >= equipment.interval
    })
  }

  return {
    equipments: data || [],
    error,
    loading,
    refetch,
    getFilteredEquipments,
    getStatusSummary,
    getMaintenanceNeeded
  }
}

export default useEquipmentList 