import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X,
  RotateCcw,
  Wrench,
  TrendingUp,
  DollarSign,
  CalendarDays,
  BarChart3,
  Filter as FilterIcon,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from './ToastContainer'

function MaintenanceList({ maintenanceData, onAddMaintenance, onViewDetail }) {
  const { showSuccess, showError, showInfo } = useToast()
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [sortField, setSortField] = useState('start_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    filterAndSortData()
  }, [maintenanceData, searchTerm, statusFilter, typeFilter, periodFilter, sortField, sortDirection])

  const filterAndSortData = () => {
    let filtered = [...maintenanceData]

    // Aplicar filtros
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.equipment_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.maintenance_type === typeFilter)
    }

    if (periodFilter !== 'all') {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      switch (periodFilter) {
        case 'last_30_days':
          filtered = filtered.filter(item => new Date(item.start_date) >= thirtyDaysAgo)
          break
        case 'last_90_days':
          filtered = filtered.filter(item => new Date(item.start_date) >= ninetyDaysAgo)
          break
        case 'this_year':
          filtered = filtered.filter(item => new Date(item.start_date).getFullYear() === now.getFullYear())
          break
      }
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'start_date' || sortField === 'end_date') {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredData(filtered)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPeriodFilter('all')
  }

  const handleViewDetail = (maintenance) => {
    onViewDetail(maintenance)
  }

  const handleEdit = (maintenance) => {
    showInfo('Funcionalidade de edição será implementada em breve!')
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('http://localhost:8000/export', {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `manutencoes_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showSuccess('Exportação realizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showError('Erro ao exportar dados');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'concluída':
        return <CheckCircle size={16} className="text-green-500" />
      case 'em andamento':
        return <Clock size={16} className="text-yellow-500" />
      case 'pendente':
        return <AlertTriangle size={16} className="text-red-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'concluída':
        return 'status-completed'
      case 'em andamento':
        return 'status-in-progress'
      case 'pendente':
        return 'status-pending'
      default:
        return 'status-default'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'concluída':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pendente':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateStats = () => {
    const total = filteredData.length
    const pending = filteredData.filter(m => m.status === 'pendente').length
    const inProgress = filteredData.filter(m => m.status === 'em andamento').length
    const completed = filteredData.filter(m => m.status === 'concluída').length
    const totalCost = filteredData.reduce((sum, m) => sum + (m.cost || 0), 0)

    return { total, pending, inProgress, completed, totalCost }
  }

  const stats = calculateStats()

  return (
    <div className="maintenance-page">
      {/* Header da Página */}
      <div className="maintenance-header">
        <div className="maintenance-header-content">
          <div className="maintenance-header-title">
            <h1 className="maintenance-title">
              <Wrench size={28} className="maintenance-title-icon" />
              Gestão de Manutenções
            </h1>
            <p className="maintenance-subtitle">
              Gerencie agendamentos, acompanhe progresso e mantenha o histórico completo
            </p>
          </div>
          <div className="maintenance-header-actions">
            <button
              onClick={onAddMaintenance}
              className="btn-primary-maintenance"
            >
              <Plus size={20} />
              Nova Manutenção
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="maintenance-stats-grid">
        <div className="stat-card-maintenance">
          <div className="stat-icon-maintenance stat-icon-total">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content-maintenance">
            <div className="stat-value-maintenance">{stats.total}</div>
            <div className="stat-label-maintenance">Total</div>
          </div>
        </div>
        <div className="stat-card-maintenance">
          <div className="stat-icon-maintenance stat-icon-pending">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content-maintenance">
            <div className="stat-value-maintenance">{stats.pending}</div>
            <div className="stat-label-maintenance">Pendentes</div>
          </div>
        </div>
        <div className="stat-card-maintenance">
          <div className="stat-icon-maintenance stat-icon-progress">
            <Clock size={24} />
          </div>
          <div className="stat-content-maintenance">
            <div className="stat-value-maintenance">{stats.inProgress}</div>
            <div className="stat-label-maintenance">Em Andamento</div>
          </div>
        </div>
        <div className="stat-card-maintenance">
          <div className="stat-icon-maintenance stat-icon-completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content-maintenance">
            <div className="stat-value-maintenance">{stats.completed}</div>
            <div className="stat-label-maintenance">Concluídas</div>
          </div>
        </div>
        <div className="stat-card-maintenance">
          <div className="stat-icon-maintenance stat-icon-cost">
            <DollarSign size={24} />
          </div>
          <div className="stat-content-maintenance">
            <div className="stat-value-maintenance">
              R$ {stats.totalCost.toLocaleString('pt-BR')}
            </div>
            <div className="stat-label-maintenance">Custo Total</div>
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="maintenance-toolbar">
        <div className="toolbar-left">
          <div className="search-container-maintenance">
            <Search size={20} className="search-icon-maintenance" />
            <input
              type="text"
              placeholder="Buscar manutenções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-maintenance"
            />
          </div>
        </div>
        
        <div className="toolbar-right">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          >
            <FilterIcon size={18} />
            Filtros
          </button>
          
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('table')}
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Visualização em Tabela"
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              title="Visualização em Cards"
            >
              <CalendarDays size={18} />
            </button>
          </div>

          <button className="export-btn-maintenance" title="Exportar Dados" onClick={handleExportData}>
            <Download size={18} />
          </button>
          
          <button className="refresh-btn-maintenance" title="Atualizar" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <div className="maintenance-filters-panel">
          <div className="filters-grid">
            <div className="filter-group-maintenance">
              <label className="filter-label-maintenance">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select-maintenance"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em andamento">Em Andamento</option>
                <option value="concluída">Concluída</option>
              </select>
            </div>

            <div className="filter-group-maintenance">
              <label className="filter-label-maintenance">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select-maintenance"
              >
                <option value="all">Todos os Tipos</option>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="preditiva">Preditiva</option>
              </select>
            </div>

            <div className="filter-group-maintenance">
              <label className="filter-label-maintenance">Período</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="filter-select-maintenance"
              >
                <option value="all">Todos os Períodos</option>
                <option value="last_30_days">Últimos 30 dias</option>
                <option value="last_90_days">Últimos 90 dias</option>
                <option value="this_year">Este ano</option>
              </select>
            </div>

            <div className="filter-group-maintenance">
              <button onClick={clearFilters} className="clear-filters-btn-maintenance">
                <RotateCcw size={16} />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="maintenance-content">
        {viewMode === 'table' ? (
          /* Visualização em Tabela */
          <div className="maintenance-table-container">
            <div className="table-responsive-maintenance">
              <table className="maintenance-table-modern">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('equipment_tag')} className="sortable-header">
                      <div className="header-content">
                        <span>Equipamento</span>
                        {sortField === 'equipment_tag' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('maintenance_type')} className="sortable-header">
                      <div className="header-content">
                        <span>Tipo</span>
                        {sortField === 'maintenance_type' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('start_date')} className="sortable-header">
                      <div className="header-content">
                        <span>Data Início</span>
                        {sortField === 'start_date' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('end_date')} className="sortable-header">
                      <div className="header-content">
                        <span>Data Fim</span>
                        {sortField === 'end_date' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable-header">
                      <div className="header-content">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('cost')} className="sortable-header">
                      <div className="header-content">
                        <span>Custo</span>
                        {sortField === 'cost' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="actions-header">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((manutencao) => (
                    <tr key={manutencao.id} className="maintenance-row-modern">
                      <td className="equipment-cell-modern">
                        <div className="equipment-info-modern">
                          <span className="equipment-tag-modern">{manutencao.equipment_tag}</span>
                        </div>
                      </td>
                      <td className="type-cell-modern">
                        <span className="maintenance-type-modern">{manutencao.maintenance_type}</span>
                      </td>
                      <td className="date-cell-modern">
                        {new Date(manutencao.start_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="date-cell-modern">
                        {manutencao.end_date 
                          ? new Date(manutencao.end_date).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </td>
                      <td className="status-cell-modern">
                        <div className={`status-badge-modern ${getStatusBadgeColor(manutencao.status)}`}>
                          {getStatusIcon(manutencao.status)}
                          <span>{manutencao.status}</span>
                        </div>
                      </td>
                      <td className="cost-cell-modern">
                        {manutencao.cost ? `R$ ${manutencao.cost.toFixed(2)}` : '-'}
                      </td>
                      <td className="actions-cell-modern">
                        <div className="action-buttons-modern">
                          <button
                            onClick={() => handleViewDetail(manutencao)}
                            className="action-btn-modern view-btn-modern"
                            title="Ver Detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(manutencao)}
                            className="action-btn-modern edit-btn-modern"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button className="action-btn-modern more-btn-modern" title="Mais Opções">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Visualização em Cards */
          <div className="maintenance-cards-grid">
            {filteredData.map((manutencao) => (
              <div key={manutencao.id} className="maintenance-card-modern">
                <div className="card-header-modern">
                  <div className="card-equipment-info">
                    <span className="equipment-tag-card">{manutencao.equipment_tag}</span>
                    <span className="maintenance-type-card">{manutencao.maintenance_type}</span>
                  </div>
                  <div className={`status-badge-card ${getStatusBadgeColor(manutencao.status)}`}>
                    {getStatusIcon(manutencao.status)}
                    <span>{manutencao.status}</span>
                  </div>
                </div>
                
                <div className="card-content-modern">
                  <div className="info-row-card">
                    <Calendar size={16} className="info-icon-card" />
                    <div className="info-content-card">
                      <span className="info-label-card">Início:</span>
                      <span className="info-value-card">
                        {new Date(manutencao.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="info-row-card">
                    <Clock size={16} className="info-icon-card" />
                    <div className="info-content-card">
                      <span className="info-label-card">Fim:</span>
                      <span className="info-value-card">
                        {manutencao.end_date 
                          ? new Date(manutencao.end_date).toLocaleDateString('pt-BR')
                          : 'Não concluída'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="info-row-card">
                    <DollarSign size={16} className="info-icon-card" />
                    <div className="info-content-card">
                      <span className="info-label-card">Custo:</span>
                      <span className="info-value-card">
                        {manutencao.cost ? `R$ ${manutencao.cost.toFixed(2)}` : 'Não especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions-modern">
                  <button
                    onClick={() => handleViewDetail(manutencao)}
                    className="action-btn-card view-btn-card"
                  >
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleEdit(manutencao)}
                    className="action-btn-card edit-btn-card"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado Vazio */}
        {filteredData.length === 0 && (
          <div className="empty-state-maintenance">
            <div className="empty-icon-maintenance">
              <Wrench size={64} />
            </div>
            <h3 className="empty-title-maintenance">Nenhuma manutenção encontrada</h3>
            <p className="empty-description-maintenance">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || periodFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando uma nova manutenção'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && periodFilter === 'all' && (
              <button onClick={onAddMaintenance} className="btn-primary-maintenance">
                <Plus size={16} />
                Nova Manutenção
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MaintenanceList