import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Wrench, CheckCircle, AlertTriangle, X } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

function MaintenanceDetailPage() {
  const { maintenanceId } = useParams()
  const navigate = useNavigate()
  const [maintenance, setMaintenance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMaintenanceDetail = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}/maintenance/${maintenanceId}`)
        setMaintenance(response.data)
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar detalhes da manutenção:', err)
        setError('Erro ao carregar detalhes da manutenção')
      } finally {
        setLoading(false)
      }
    }

    if (maintenanceId) {
      fetchMaintenanceDetail()
    }
  }, [maintenanceId])

  const handleClose = () => {
    navigate('/maintenance')
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'concluída':
        return <CheckCircle size={20} className="text-green-500" />
      case 'em andamento':
        return <Clock size={20} className="text-yellow-500" />
      case 'pendente':
        return <AlertTriangle size={20} className="text-red-500" />
      default:
        return <Clock size={20} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
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

  if (loading) {
    return (
      <div className="maintenance-detail-page">
        <div className="maintenance-detail-loading">
          <div className="loading-spinner"></div>
          <p>Carregando detalhes da manutenção...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="maintenance-detail-page">
        <div className="maintenance-detail-error">
          <AlertTriangle size={48} className="text-red-500" />
          <h2>Erro ao carregar manutenção</h2>
          <p>{error}</p>
          <button onClick={handleClose} className="btn-primary">
            Voltar para Manutenções
          </button>
        </div>
      </div>
    )
  }

  if (!maintenance) {
    return (
      <div className="maintenance-detail-page">
        <div className="maintenance-detail-not-found">
          <X size={48} className="text-gray-500" />
          <h2>Manutenção não encontrada</h2>
          <p>A manutenção solicitada não foi encontrada.</p>
          <button onClick={handleClose} className="btn-primary">
            Voltar para Manutenções
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="maintenance-detail-page">
      <div className="maintenance-detail-header">
        <button onClick={handleClose} className="back-button">
          <ArrowLeft size={20} />
          Voltar para Manutenções
        </button>
        <div className="maintenance-detail-title">
          <h1>Detalhes da Manutenção</h1>
          <div className={`status-badge ${getStatusColor(maintenance.status)}`}>
            {getStatusIcon(maintenance.status)}
            <span>{maintenance.status}</span>
          </div>
        </div>
      </div>

      <div className="maintenance-detail-content">
        <div className="maintenance-info-grid">
          <div className="maintenance-info-card">
            <h3>Informações Gerais</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Equipamento:</label>
                <span>{maintenance.equipment_tag}</span>
              </div>
              <div className="info-item">
                <label>Tipo de Manutenção:</label>
                <span>{maintenance.maintenance_type}</span>
              </div>
              <div className="info-item">
                <label>Data de Início:</label>
                <span>{new Date(maintenance.start_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="info-item">
                <label>Data de Conclusão:</label>
                <span>{maintenance.end_date ? new Date(maintenance.end_date).toLocaleDateString('pt-BR') : 'Não concluída'}</span>
              </div>
              <div className="info-item">
                <label>Fornecedor:</label>
                <span>{maintenance.supplier || 'Não especificado'}</span>
              </div>
              <div className="info-item">
                <label>Custo:</label>
                <span>{maintenance.cost ? `R$ ${maintenance.cost.toFixed(2)}` : 'Não especificado'}</span>
              </div>
            </div>
          </div>

          <div className="maintenance-description-card">
            <h3>Descrição</h3>
            <p>{maintenance.description || 'Nenhuma descrição fornecida.'}</p>
          </div>

          {maintenance.observations && (
            <div className="maintenance-observations-card">
              <h3>Observações</h3>
              <p>{maintenance.observations}</p>
            </div>
          )}

          <div className="maintenance-checklist-card">
            <h3>Checklist de Manutenção</h3>
            <div className="checklist-grid">
              <div className="checklist-item">
                <CheckCircle size={16} className="text-green-500" />
                <span>Verificação de óleo</span>
              </div>
              <div className="checklist-item">
                <CheckCircle size={16} className="text-green-500" />
                <span>Troca de filtros</span>
              </div>
              <div className="checklist-item">
                <CheckCircle size={16} className="text-green-500" />
                <span>Inspeção de freios</span>
              </div>
              <div className="checklist-item">
                <CheckCircle size={16} className="text-green-500" />
                <span>Verificação de pneus</span>
              </div>
              <div className="checklist-item">
                <CheckCircle size={16} className="text-green-500" />
                <span>Teste de funcionamento</span>
              </div>
            </div>
          </div>

          <div className="maintenance-schedule-card">
            <h3>Próximas Manutenções</h3>
            <div className="schedule-list">
              <div className="schedule-item">
                <Calendar size={16} />
                <div className="schedule-info">
                  <span className="schedule-date">15/12/2024</span>
                  <span className="schedule-type">Manutenção Preventiva</span>
                </div>
              </div>
              <div className="schedule-item">
                <Calendar size={16} />
                <div className="schedule-info">
                  <span className="schedule-date">30/01/2025</span>
                  <span className="schedule-type">Troca de Óleo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDetailPage 