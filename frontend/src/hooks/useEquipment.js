import { useState, useEffect, useCallback } from 'react'
import { equipmentService } from '../services/api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants'

export const useEquipment = () => {
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  // Buscar todos os equipamentos
  const fetchEquipments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await equipmentService.getAll()
      setEquipments(response.data)
      setError(null)
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar um equipamento específico
  const fetchEquipmentById = useCallback(async (id) => {
    try {
      setLoading(true)
      const response = await equipmentService.getById(id)
      setSelectedEquipment(response.data)
      setError(null)
      return response.data
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar novo equipamento
  const createEquipment = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await equipmentService.create(data)
      setEquipments(prev => [...prev, response.data])
      setError(null)
      return { success: true, message: SUCCESS_MESSAGES.save }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar equipamento
  const updateEquipment = useCallback(async (id, data) => {
    try {
      setLoading(true)
      const response = await equipmentService.update(id, data)
      setEquipments(prev => 
        prev.map(equipment => 
          equipment.id === id ? response.data : equipment
        )
      )
      setError(null)
      return { success: true, message: SUCCESS_MESSAGES.update }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Excluir equipamento
  const deleteEquipment = useCallback(async (id) => {
    try {
      setLoading(true)
      await equipmentService.delete(id)
      setEquipments(prev => prev.filter(equipment => equipment.id !== id))
      setError(null)
      return { success: true, message: SUCCESS_MESSAGES.delete }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar intervalo de manutenção
  const updateInterval = useCallback(async (id, interval) => {
    try {
      setLoading(true)
      const response = await equipmentService.updateInterval(id, interval)
      setEquipments(prev => 
        prev.map(equipment => 
          equipment.id === id ? { ...equipment, interval } : equipment
        )
      )
      setError(null)
      return { success: true, message: SUCCESS_MESSAGES.update }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar histórico de um equipamento
  const fetchEquipmentHistory = useCallback(async (id) => {
    try {
      setLoading(true)
      const response = await equipmentService.getHistory(id)
      setError(null)
      return response.data
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.general)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Filtrar equipamentos
  const filterEquipments = useCallback((filters) => {
    return equipments.filter(equipment => {
      const matchesSearch = filters.searchTerm ? 
        equipment.tag.toLowerCase().includes(filters.searchTerm.toLowerCase()) :
        true

      const matchesStatus = filters.status === 'all' ? 
        true : 
        equipment.status === filters.status

      const matchesType = filters.type === 'all' ? 
        true : 
        equipment.type === filters.type

      return matchesSearch && matchesStatus && matchesType
    })
  }, [equipments])

  // Ordenar equipamentos
  const sortEquipments = useCallback((equipmentList, { field, direction }) => {
    return [...equipmentList].sort((a, b) => {
      if (direction === 'asc') {
        return a[field] > b[field] ? 1 : -1
      }
      return a[field] < b[field] ? 1 : -1
    })
  }, [])

  // Carregar equipamentos ao montar o componente
  useEffect(() => {
    fetchEquipments()
  }, [fetchEquipments])

  return {
    equipments,
    loading,
    error,
    selectedEquipment,
    fetchEquipments,
    fetchEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    updateInterval,
    fetchEquipmentHistory,
    filterEquipments,
    sortEquipments,
    setSelectedEquipment
  }
}

export default useEquipment 