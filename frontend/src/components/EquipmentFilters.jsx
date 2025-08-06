import React, { useState } from 'react'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import styles from './EquipmentFilters.module.css'

const EquipmentFilters = ({ onFilterChange, equipmentList }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = () => {
    onFilterChange({
      searchTerm,
      statusFilter,
      typeFilter
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    onFilterChange({
      searchTerm: '',
      statusFilter: 'all',
      typeFilter: 'all'
    })
  }

  const getPriorityClass = (equipment) => {
    if (!equipment.intervalo || equipment.intervalo === 0) return 'info'
    
    const uso = equipment.atual - equipment.ultima_manut
    const percentual = (uso / equipment.intervalo) * 100
    
    if (percentual >= 100) return 'critical'
    if (percentual >= 90) return 'warning'
    return 'ok'
  }

  const getStatusCount = (status) => {
    return equipmentList.filter(eq => getPriorityClass(eq) === status).length
  }

  const getTypeCount = (type) => {
    return equipmentList.filter(eq => eq.tipo === type).length
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all'

  React.useEffect(() => {
    handleFilterChange()
  }, [searchTerm, statusFilter, typeFilter])

  return (
    <div className={`card ${styles.filtersCard}`}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <Filter size={20} />
          <span>Filtros e Busca</span>
        </div>
        <div className={styles.filtersActions}>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              title="Limpar todos os filtros"
            >
              <X size={14} />
              <span>Limpar</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <SlidersHorizontal size={14} />
            <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
          </button>
        </div>
      </div>

      {/* Busca Rápida */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar equipamento por TAG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`form-input ${styles.searchInput}`}
            />
          </div>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filtersGrid}>
            {/* Filtro por Status */}
            <div className="form-group">
              <label className="form-label">
                Status do Equipamento
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">Todos os Status ({equipmentList.length})</option>
                <option value="critical">Críticos ({getStatusCount('critical')})</option>
                <option value="warning">Atenção ({getStatusCount('warning')})</option>
                <option value="ok">OK ({getStatusCount('ok')})</option>
                <option value="info">Sem Intervalo ({getStatusCount('info')})</option>
              </select>
            </div>
            {/* Filtro por Tipo */}
            <div className="form-group">
              <label className="form-label">
                Tipo de Equipamento
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">Todos os Tipos ({equipmentList.length})</option>
                <option value="HORAS">Máquinas ({getTypeCount('HORAS')})</option>
                <option value="KM">Veículos ({getTypeCount('KM')})</option>
              </select>
            </div>
          </div>
          {/* Resumo dos Filtros Ativos */}
          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className={styles.activeFilters}>
              <div className={styles.activeFiltersContent}>
                <strong>Filtros ativos:</strong>
                <div className={styles.activeFiltersTags}>
                  {statusFilter !== 'all' && (
                    <span className={styles.filterTag}>
                      Status: {statusFilter}
                    </span>
                  )}
                  {typeFilter !== 'all' && (
                    <span className={styles.filterTag}>
                      Tipo: {typeFilter}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EquipmentFilters