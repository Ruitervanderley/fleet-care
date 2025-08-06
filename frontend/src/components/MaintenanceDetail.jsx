import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  X, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  DollarSign,
  User
} from 'lucide-react'
import { useToast } from './ToastContainer'

const API_BASE = 'http://localhost:8000'

const MaintenanceDetail = ({ maintenanceId, onClose }) => {
  const { showSuccess, showError, showInfo } = useToast()
  const [maintenance, setMaintenance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenanceDetail()
      // Scroll suave para o topo quando o modal abrir
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [maintenanceId])

  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (maintenance) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [maintenance])

  const fetchMaintenanceDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/maintenance/${maintenanceId}`)
      setMaintenance(response.data)
    } catch (err) {
      console.error('Erro ao carregar detalhes da manutenção:', err)
      alert('Erro ao carregar detalhes da manutenção')
    } finally {
      setLoading(false)
    }
  }

  const addChecklistItem = async () => {
    if (!newChecklistItem.trim()) return
    try {
      await axios.post(`${API_BASE}/maintenance/${maintenanceId}/checklist`, {
        item: newChecklistItem,
        responsavel: 'Usuário Atual'
      })
      setNewChecklistItem('')
      fetchMaintenanceDetail()
      showSuccess('Item adicionado ao checklist!')
    } catch (err) {
      showError('Erro ao adicionar item ao checklist')
      console.error('Erro:', err)
    }
  }

  const updateChecklistItem = async (itemId, updates) => {
    try {
      await axios.put(`${API_BASE}/maintenance/checklist/${itemId}`, updates)
      setEditingItem(null)
      fetchMaintenanceDetail()
      showSuccess('Item do checklist atualizado!')
    } catch (err) {
      showError('Erro ao atualizar item do checklist')
      console.error('Erro:', err)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDENTE': return <span className="priority-badge priority-warning">Pendente</span>
      case 'EM_ANDAMENTO': return <span className="priority-badge priority-info">Em Andamento</span>
      case 'CONCLUIDO': return <span className="priority-badge priority-ok">Concluído</span>
      default: return <span className="priority-badge priority-info">{status}</span>
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (value) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">
            <div className="animate-spin" style={{ fontSize: 32 }}><Clock /></div>
            <p>Carregando detalhes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!maintenance) {
    return null
  }

  const { manutencao, checklist, agendamentos } = maintenance

  return (
    <div className="modal-overlay">
      <div className="modal-content maintenance-detail-modal">
        {/* Header do modal */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <Wrench size={28} className="modal-icon" />
            <span className="modal-title">Manutenção</span>
            <span className="priority-badge priority-info">{manutencao.tag}</span>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            title="Fechar"
          >
            <X size={28} />
          </button>
        </div>
        <div className="modal-body">
          {/* Tabs */}
          <div className="tabs-bar">
            <button
              onClick={() => setActiveTab('details')}
              className={`tab-btn${activeTab === 'details' ? ' active' : ''}`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`tab-btn${activeTab === 'checklist' ? ' active' : ''}`}
            >
              Checklist ({checklist.length})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`tab-btn${activeTab === 'schedule' ? ' active' : ''}`}
            >
              Agendamentos ({agendamentos.length})
            </button>
          </div>

          {/* Content */}
          <div className="modal-content-wrapper">
            {activeTab === 'details' && (
              <div className="maintenance-details-card">
                <div className="card-header">
                  <h3 className="card-title">Informações Gerais</h3>
                </div>
                <div className="maintenance-info">
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Equipamento:</span>
                    <span className="maintenance-info-value">{manutencao.tag}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Tipo:</span>
                    <span className="maintenance-info-value">{manutencao.tipo_manutencao}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Status:</span>
                    <span className="maintenance-info-value">{getStatusBadge(manutencao.status)}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Data Agendada:</span>
                    <span className="maintenance-info-value">{formatDate(manutencao.data_agendada)}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Responsável:</span>
                    <span className="maintenance-info-value">{manutencao.responsavel || '-'}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Valor Orçado:</span>
                    <span className="maintenance-info-value">{formatCurrency(manutencao.valor_orcado)}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <span className="maintenance-info-label">Local:</span>
                    <span className="maintenance-info-value">{manutencao.local || '-'}</span>
                  </div>
                </div>
                {manutencao.observacoes && (
                  <div className="maintenance-observations">
                    <span className="maintenance-info-label">Observações:</span>
                    <div className="maintenance-info-value">{manutencao.observacoes}</div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'checklist' && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <h3 className="card-title">Checklist de Manutenção</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Novo item do checklist..."
                      className="form-input"
                      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                      style={{ minWidth: 180 }}
                    />
                    <button
                      onClick={addChecklistItem}
                      className="btn btn-primary btn-sm"
                      type="button"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="maintenance-info" style={{ flexDirection: 'column', gap: 12 }}>
                  {checklist.map((item) => (
                    <div key={item.id} className="card" style={{ marginBottom: 8, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        {getStatusBadge(item.status)}
                        <span className="maintenance-info-value" style={{ flex: 1 }}>{item.item}</span>
                        <button
                          onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                          className="btn btn-secondary btn-sm"
                          type="button"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      {editingItem === item.id && (
                        <div className="form-grid" style={{ marginTop: 12, gap: 12 }}>
                          <select
                            value={item.status}
                            onChange={(e) => updateChecklistItem(item.id, { ...item, status: e.target.value })}
                            className="form-select"
                          >
                            <option value="PENDENTE">Pendente</option>
                            <option value="EM_ANDAMENTO">Em Andamento</option>
                            <option value="CONCLUIDO">Concluído</option>
                          </select>
                          <input
                            type="text"
                            value={item.observacao || ''}
                            onChange={(e) => updateChecklistItem(item.id, { ...item, observacao: e.target.value })}
                            placeholder="Observação..."
                            className="form-input"
                          />
                          <input
                            type="text"
                            value={item.responsavel || ''}
                            onChange={(e) => updateChecklistItem(item.id, { ...item, responsavel: e.target.value })}
                            placeholder="Responsável..."
                            className="form-input"
                          />
                        </div>
                      )}
                      {(item.observacao || item.responsavel || item.data_conclusao) && (
                        <div className="maintenance-info" style={{ marginTop: 8, gap: 8 }}>
                          {item.observacao && <div className="maintenance-info-label">Obs: <span className="maintenance-info-value">{item.observacao}</span></div>}
                          {item.responsavel && <div className="maintenance-info-label">Responsável: <span className="maintenance-info-value">{item.responsavel}</span></div>}
                          {item.data_conclusao && <div className="maintenance-info-label">Concluído em: <span className="maintenance-info-value">{formatDate(item.data_conclusao)}</span></div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {checklist.length === 0 && (
                    <div className="empty-state">
                      <CheckCircle size={48} />
                      <h3>Nenhum item no checklist</h3>
                      <p>Adicione itens para acompanhar o progresso da manutenção.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'schedule' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Agendamentos</h3>
                </div>
                <div className="maintenance-info" style={{ flexDirection: 'column', gap: 12 }}>
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="card" style={{ marginBottom: 8, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Calendar size={20} className="text-info" />
                        <div style={{ flex: 1 }}>
                          <div className="maintenance-info-value" style={{ fontWeight: 600 }}>{formatDate(agendamento.data_hora)}</div>
                          <div className="maintenance-info-label">Duração: {agendamento.duracao_estimada} min • Local: {agendamento.local}</div>
                          {agendamento.responsavel && (
                            <div className="maintenance-info-label">Responsável: <span className="maintenance-info-value">{agendamento.responsavel}</span></div>
                          )}
                        </div>
                        {getStatusBadge(agendamento.status)}
                      </div>
                    </div>
                  ))}
                  {agendamentos.length === 0 && (
                    <div className="empty-state">
                      <Calendar size={48} />
                      <h3>Nenhum agendamento encontrado</h3>
                      <p>Os agendamentos aparecerão aqui quando criados.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDetail 