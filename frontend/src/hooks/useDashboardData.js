import useData from './useData'
import axios from 'axios'

export const useDashboardData = () => {
  const { data, error, loading, refetch } = useData('/dashboard', {
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  })

  const getEquipmentStatusData = () => {
    if (!data?.equipmentList) return []
    
    return data.equipmentList.reduce((acc, equipment) => {
      acc[equipment.status] = (acc[equipment.status] || 0) + 1
      return acc
    }, {})
  }

  const getMaintenanceStats = () => {
    if (!data?.maintenanceData) return {
      total: 0,
      pending: 0,
      completed: 0,
      critical: 0
    }

    return {
      total: data.maintenanceData.length,
      pending: data.maintenanceData.filter(m => m.status === 'pending').length,
      completed: data.maintenanceData.filter(m => m.status === 'completed').length,
      critical: data.maintenanceData.filter(m => m.priority === 'high').length
    }
  }

  const getAlerts = () => {
    if (!data?.alerts) return []
    return data.alerts
  }

  return {
    data,
    error,
    loading,
    refetch,
    getEquipmentStatusData,
    getMaintenanceStats,
    getAlerts
  }
}

export default useDashboardData 