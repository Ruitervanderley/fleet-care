import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Bell
} from 'lucide-react'

const CriticalAlerts = () => {
  const [alertsData, setAlertsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    criticos: true,
    proximos: true,
    desatualizados: true
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/dashboard/alerts')
      setAlertsData(response.data)
      
      // Atualizar contagem de notificações
      const totalAlerts = 
        response.data.alertas_criticos.length + 
        response.data.proximos_manutencao.length + 
        response.data.sem_atualizacao.length
      setNotificationCount(totalAlerts)
      
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar alertas:', err)
      setError('Erro ao carregar alertas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filterAlerts = (alerts) => {
    if (!alerts) return []
    
    return alerts.filter(alert => {
      const matchesSearch = alert.tag.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === 'all' || 
        (alert.prioridade || 'media').toLowerCase() === filterPriority
      
      return matchesSearch && matchesPriority
    })
  }

  if (loading) {
    return (
      <div className="alerts-container">
        <div className="alerts-header">
          <h2>
            <RefreshCw className="animate-spin" size={20} />
            Carregando Alertas...
          </h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alerts-container">
        <div className="alerts-header">
          <h2>
            <AlertCircle size={20} />
            Alertas Críticos
          </h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  const { alertas_criticos, proximos_manutencao, sem_atualizacao, estatisticas } = alertsData

  return (
    <div className="alerts-container">
      {/* Cabeçalho com Filtros */}
      <div className="alerts-header">
        <div className="header-title">
          <h2>
            <Bell size={20} />
            Alertas e Notificações
          </h2>
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <Filter size={16} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">Todas prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <button 
            className="refresh-button"
            onClick={fetchAlerts}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        <div className="status-card critical">
          <div className="status-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.equipamentos_criticos}</div>
            <div className="status-title">Críticos</div>
            <div className="status-description">Precisam de manutenção urgente</div>
          </div>
        </div>
        <div className="status-card warning">
          <div className="status-icon">
            <Clock size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.proximos_manutencao}</div>
            <div className="status-title">Próximos</div>
            <div className="status-description">Próximos da manutenção</div>
          </div>
        </div>
        <div className="status-card info">
          <div className="status-icon">
            <AlertCircle size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.sem_atualizacao_recente}</div>
            <div className="status-title">Desatualizados</div>
            <div className="status-description">Sem atualização recente</div>
          </div>
        </div>
      </div>

      {/* Alertas Críticos */}
      {filterAlerts(alertas_criticos).length > 0 && (
        <div className="alert-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('criticos')}
          >
            <div className="section-title">
              <AlertTriangle size={20} className="text-danger" />
              <h3>Equipamentos Críticos ({filterAlerts(alertas_criticos).length})</h3>
            </div>
            {expandedSections.criticos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSections.criticos && (
            <div className="alert-list">
              {filterAlerts(alertas_criticos).map((alerta, index) => (
                <div 
                  key={index}
                  className="alert-item critical"
                >
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{alerta.tag}</strong>
                      <span className={`priority-badge priority-${(alerta.prioridade || 'alta').toLowerCase()}`}>
                        {alerta.prioridade || 'Alta'}
                      </span>
                    </div>
                    <div className="alert-details">
                      <div className="detail-item">
                        <span className="detail-label">Uso atual:</span>
                        <span className="detail-value">
                          {alerta.uso.toLocaleString('pt-BR')} {alerta.tipo === 'KM' ? 'km' : 'horas'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Intervalo:</span>
                        <span className="detail-value">
                          {alerta.intervalo.toLocaleString('pt-BR')} {alerta.tipo === 'KM' ? 'km' : 'horas'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Percentual:</span>
                        <span className="detail-value">
                          {alerta.percentual.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="alert-meta">
                    <div className="meta-item">
                      <Clock size={14} />
                      Última atualização: {alerta.ultima_atualizacao || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Próximos da Manutenção */}
      {filterAlerts(proximos_manutencao).length > 0 && (
        <div className="alert-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('proximos')}
          >
            <div className="section-title">
              <Clock size={20} className="text-warning" />
              <h3>Próximos da Manutenção ({filterAlerts(proximos_manutencao).length})</h3>
            </div>
            {expandedSections.proximos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSections.proximos && (
            <div className="alert-list">
              {filterAlerts(proximos_manutencao).map((proximo, index) => (
                <div 
                  key={index}
                  className="alert-item warning"
                >
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{proximo.tag}</strong>
                      <span className="days-remaining">
                        {proximo.dias_restantes} dias restantes
                      </span>
                    </div>
                    <div className="alert-details">
                      <div className="detail-item">
                        <span className="detail-label">Uso atual:</span>
                        <span className="detail-value">
                          {proximo.uso.toLocaleString('pt-BR')} {proximo.tipo === 'KM' ? 'km' : 'horas'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Percentual:</span>
                        <span className="detail-value">
                          {proximo.percentual.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sem Atualização Recente */}
      {filterAlerts(sem_atualizacao).length > 0 && (
        <div className="alert-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('desatualizados')}
          >
            <div className="section-title">
              <AlertCircle size={20} className="text-info" />
              <h3>Sem Atualização Recente ({filterAlerts(sem_atualizacao).length})</h3>
            </div>
            {expandedSections.desatualizados ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {expandedSections.desatualizados && (
            <div className="alert-list">
              {filterAlerts(sem_atualizacao).map((item, index) => (
                <div 
                  key={index}
                  className="alert-item info"
                >
                  <div className="alert-content">
                    <div className="alert-header">
                      <strong>{item.tag}</strong>
                      <span className="equipment-type">
                        {item.tipo === 'KM' ? 'Veículo' : 'Máquina'}
                      </span>
                    </div>
                    <div className="alert-meta">
                      <div className="meta-item">
                        <Clock size={14} />
                        Última atualização: {item.ultima_atualizacao || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CriticalAlerts 