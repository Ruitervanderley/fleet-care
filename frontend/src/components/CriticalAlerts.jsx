import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AlertTriangle, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'

const CriticalAlerts = () => {
  const [alertsData, setAlertsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/dashboard/alerts')
      setAlertsData(response.data)
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
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <RefreshCw className="animate-spin" size={20} />
            Carregando Alertas...
          </h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <AlertCircle size={20} />
            Alertas Críticos
          </h2>
        </div>
        <div className="error" style={{ margin: 0 }}>{error}</div>
      </div>
    )
  }

  const { alertas_criticos, proximos_manutencao, sem_atualizacao, estatisticas } = alertsData

  return (
    <div>
      {/* Estatísticas Gerais */}
      <div className="status-grid" style={{ marginBottom: 20 }}>
        <div className="status-card animate-status-card" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', borderColor: '#ef4444' }}>
          <div className="status-icon" style={{ color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.equipamentos_criticos}</div>
            <div className="status-title">Críticos</div>
            <div className="status-description">Precisam de manutenção urgente</div>
          </div>
        </div>
        <div className="status-card animate-status-card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderColor: '#f59e0b' }}>
          <div className="status-icon" style={{ color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.proximos_manutencao}</div>
            <div className="status-title">Próximos</div>
            <div className="status-description">Próximos da manutenção</div>
          </div>
        </div>
        <div className="status-card animate-status-card" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderColor: '#3b82f6' }}>
          <div className="status-icon" style={{ color: '#3b82f6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="status-content">
            <div className="status-value">{estatisticas.total_equipamentos}</div>
            <div className="status-title">Total</div>
            <div className="status-description">Equipamentos monitorados</div>
          </div>
        </div>
        <div className="status-card animate-status-card" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', borderColor: '#64748b' }}>
          <div className="status-icon" style={{ color: '#64748b' }}>
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
      {alertas_criticos.length > 0 && (
        <div className="card card-alert">
          <div className="card-header">
            <h2 className="card-title">
              <AlertTriangle size={20} className="text-danger" />
              Equipamentos Críticos ({alertas_criticos.length})
            </h2>
          </div>
          <div className="alert-list">
            {alertas_criticos.map((alerta, index) => (
              <div 
                key={index}
                className="alert-item alert-danger"
              >
                <div>
                  <strong>{alerta.tag}</strong>
                  <div className="alert-item-desc">
                    {alerta.uso.toLocaleString('pt-BR')} {alerta.tipo === 'KM' ? 'km' : 'horas'} 
                    ({alerta.percentual.toFixed(1)}% do intervalo de {alerta.intervalo.toLocaleString('pt-BR')})
                  </div>
                </div>
                <div className="alert-item-date">
                  Última atualização: {alerta.ultima_atualizacao || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximos da Manutenção */}
      {proximos_manutencao.length > 0 && (
        <div className="card card-alert">
          <div className="card-header">
            <h2 className="card-title">
              <Clock size={20} className="text-warning" />
              Próximos da Manutenção ({proximos_manutencao.length})
            </h2>
          </div>
          <div className="alert-list">
            {proximos_manutencao.map((proximo, index) => (
              <div 
                key={index}
                className="alert-item alert-warning"
              >
                <div>
                  <strong>{proximo.tag}</strong>
                  <div className="alert-item-desc">
                    {proximo.uso.toLocaleString('pt-BR')} {proximo.tipo === 'KM' ? 'km' : 'horas'} 
                    ({proximo.percentual.toFixed(1)}% do intervalo)
                  </div>
                </div>
                <div className="alert-item-date">
                  ~{proximo.dias_restantes} dias restantes
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sem Atualização Recente */}
      {sem_atualizacao.length > 0 && (
        <div className="card card-alert">
          <div className="card-header">
            <h2 className="card-title">
              <AlertCircle size={20} className="text-info" />
              Sem Atualização Recente ({sem_atualizacao.length})
            </h2>
          </div>
          <div className="alert-list">
            {sem_atualizacao.map((item, index) => (
              <div 
                key={index}
                className="alert-item alert-info"
              >
                <div>
                  <strong>{item.tag}</strong>
                  <div className="alert-item-desc">
                    Última atualização: {item.ultima_atualizacao || 'N/A'}
                  </div>
                </div>
                <div className="alert-item-date">
                  {item.tipo === 'KM' ? 'Veículo' : 'Máquina'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CriticalAlerts 