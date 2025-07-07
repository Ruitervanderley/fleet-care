import React, { useState, useEffect } from 'react'
import MaintenanceDetail from './MaintenanceDetail'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Calendar, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Phone,
  DollarSign,
  User,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'react-toastify'

const API_BASE = 'http://localhost:8000'

const MaintenanceList = () => {
  const [manutencoes, setManutencoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [fornecedores, setFornecedores] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Estados para formulário de criação
  const [newMaintenance, setNewMaintenance] = useState({
    tag: '',
    tipo_manutencao: '',
    data_agendada: '',
    fornecedor_id: '',
    valor_orcado: '',
    observacoes: '',
    duracao_estimada: 60,
    local: 'Oficina',
    responsavel: ''
  })

  useEffect(() => {
    fetchMaintenanceList()
    fetchSuppliers()
    fetchEquipmentList()
  }, [])

  const fetchMaintenanceList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/maintenance`)
      setManutencoes(response.data.manutencoes || [])
    } catch (err) {
      console.error('Erro ao carregar manutenções:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers`)
      setFornecedores(response.data.fornecedores || [])
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err)
    }
  }

  const fetchEquipmentList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/equipment`)
      setEquipmentList(response.data || [])
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err)
    }
  }

  const createMaintenance = async () => {
    try {
      await axios.post(`${API_BASE}/maintenance`, newMaintenance)
      setShowCreateModal(false)
      setNewMaintenance({
        tag: '',
        tipo_manutencao: '',
        data_agendada: '',
        fornecedor_id: '',
        valor_orcado: '',
        observacoes: '',
        duracao_estimada: 60,
        local: 'Oficina',
        responsavel: ''
      })
      fetchMaintenanceList()
      toast.success('Manutenção criada com sucesso!')
    } catch (err) {
      toast.error('Erro ao criar manutenção')
      console.error('Erro:', err)
    }
  }

  const deleteMaintenance = async (id) => {
    setDeleting(true)
    try {
      await axios.delete(`${API_BASE}/maintenance/${id}`)
      toast.success('Manutenção excluída com sucesso!')
      setMaintenanceToDelete(null)
      fetchMaintenanceList()
    } catch (err) {
      toast.error('Erro ao excluir manutenção')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'AGENDADA': return 'bg-blue-100 text-blue-800'
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-800'
      case 'CONCLUIDA': return 'bg-green-100 text-green-800'
      case 'CANCELADA': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AGENDADA': return <Calendar size={16} />
      case 'EM_ANDAMENTO': return <Wrench size={16} />
      case 'CONCLUIDA': return <CheckCircle size={16} />
      case 'CANCELADA': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR })
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
    // Skeleton loading
    return (
      <div className="maintenance-container">
        <div className="maintenance-header">
          <div>
            <div className="skeleton skeleton-title" style={{ width: 220, height: 32, marginBottom: 8 }} />
            <div className="skeleton skeleton-text" style={{ width: 320, height: 18 }} />
          </div>
          <div className="skeleton" style={{ width: 160, height: 40, borderRadius: 8 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8, margin: '32px 0 8px' }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 56, borderRadius: 8, marginBottom: 12 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="maintenance-container">
      {/* Header */}
      <div className="maintenance-header premium-header">
        <div>
          <h2 className="maintenance-title gradient-text">
            <Wrench size={28} style={{marginRight:8, color:'var(--accent-color)'}} /> Gestão de Manutenções
          </h2>
          <p className="maintenance-subtitle">
            Gerencie agendamentos, checklists e histórico de manutenções de forma visual e intuitiva
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary shadow-lg"
        >
          <Plus size={20} /> Nova Manutenção
        </button>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid premium-stats">
        <div className="stat-card premium-stat-card">
          <div className="stat-content">
            <Calendar className="stat-icon stat-icon-blue" size={28} />
            <div className="stat-info">
              <p className="stat-label">Agendadas</p>
              <p className="stat-value">
                {manutencoes.filter(m => m.status === 'AGENDADA').length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card premium-stat-card">
          <div className="stat-content">
            <Wrench className="stat-icon stat-icon-yellow" size={28} />
            <div className="stat-info">
              <p className="stat-label">Em Andamento</p>
              <p className="stat-value">
                {manutencoes.filter(m => m.status === 'EM_ANDAMENTO').length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card premium-stat-card">
          <div className="stat-content">
            <CheckCircle className="stat-icon stat-icon-green" size={28} />
            <div className="stat-info">
              <p className="stat-label">Concluídas</p>
              <p className="stat-value">
                {manutencoes.filter(m => m.status === 'CONCLUIDA').length}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card premium-stat-card">
          <div className="stat-content">
            <DollarSign className="stat-icon stat-icon-purple" size={28} />
            <div className="stat-info">
              <p className="stat-label">Total Investido</p>
              <p className="stat-value">
                {formatCurrency(
                  manutencoes
                    .filter(m => m.valor_real)
                    .reduce((sum, m) => sum + (m.valor_real || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Manutenções */}
      <div className="card premium-card">
        <div className="table-container">
          <table className="maintenance-table premium-table">
            <thead>
              <tr>
                <th className="maintenance-col-equipment">Equipamento</th>
                <th className="maintenance-col-type">Tipo</th>
                <th className="maintenance-col-date">Data Agendada</th>
                <th className="maintenance-col-status">Status</th>
                <th className="maintenance-col-supplier">Fornecedor</th>
                <th className="maintenance-col-value">Valor</th>
                <th className="maintenance-col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {manutencoes.map((manutencao) => (
                <tr key={manutencao.id} className="maintenance-row premium-row">
                  <td className="maintenance-cell">
                    <div className="maintenance-equipment premium-equipment">
                      <User size={16} style={{marginRight:4, color:'var(--primary-color)'}} />
                      <span>{manutencao.tag}</span>
                    </div>
                  </td>
                  <td className="maintenance-cell">
                    <div className="maintenance-type premium-type">
                      {manutencao.tipo_manutencao}
                    </div>
                  </td>
                  <td className="maintenance-cell">
                    <div className="maintenance-date premium-date">
                      {formatDate(manutencao.data_agendada)}
                    </div>
                  </td>
                  <td className="maintenance-cell">
                    <span className={`status-badge status-${manutencao.status.toLowerCase()} premium-status-badge`}>
                      {getStatusIcon(manutencao.status)}
                      <span className="status-text">{manutencao.status}</span>
                    </span>
                  </td>
                  <td className="maintenance-cell">
                    <div className="maintenance-supplier premium-supplier">
                      {manutencao.fornecedor_nome || 'N/A'}
                    </div>
                    {manutencao.fornecedor_telefone && (
                      <div className="maintenance-phone premium-phone">
                        <Phone size={12} />
                        {manutencao.fornecedor_telefone}
                      </div>
                    )}
                  </td>
                  <td className="maintenance-cell">
                    <div className="maintenance-value premium-value">
                      {formatCurrency(manutencao.valor_real || manutencao.valor_orcado)}
                    </div>
                  </td>
                  <td className="maintenance-cell">
                    <div className="maintenance-actions premium-actions">
                      <button
                        onClick={() => setSelectedMaintenance(manutencao)}
                        className="btn btn-secondary btn-sm premium-btn"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-success btn-sm premium-btn"
                        title="Editar"
                        disabled
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm premium-btn"
                        title="Excluir"
                        onClick={() => setMaintenanceToDelete(manutencao)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {manutencoes.length === 0 && (
          <div className="empty-state premium-empty">
            <Wrench size={48} />
            <h3>Nenhuma manutenção encontrada</h3>
            <p>Comece criando uma nova manutenção.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedMaintenance && (
        <MaintenanceDetail
          maintenanceId={selectedMaintenance.id}
          onClose={() => setSelectedMaintenance(null)}
        />
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="modal-overlay premium-modal">
          <div className="modal-content modal-fade" style={{ maxWidth: 800, width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title gradient-text">
                <Plus size={20} style={{marginRight:6}} /> Nova Manutenção
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
                title="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid premium-form-grid">
                <div className="form-group">
                  <label className="form-label">Equipamento</label>
                  <select
                    value={newMaintenance.tag}
                    onChange={(e) => setNewMaintenance({...newMaintenance, tag: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Selecione um equipamento</option>
                    {equipmentList.map((equip) => (
                      <option key={equip.tag} value={equip.tag}>{equip.tag}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Manutenção</label>
                  <select
                    value={newMaintenance.tipo_manutencao}
                    onChange={(e) => setNewMaintenance({...newMaintenance, tipo_manutencao: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="PREVENTIVA">Preventiva</option>
                    <option value="CORRETIVA">Corretiva</option>
                    <option value="PREDICTIVA">Preditiva</option>
                    <option value="INSPECAO">Inspeção</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data Agendada</label>
                  <input
                    type="date"
                    value={newMaintenance.data_agendada}
                    onChange={(e) => setNewMaintenance({...newMaintenance, data_agendada: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fornecedor</label>
                  <select
                    value={newMaintenance.fornecedor_id}
                    onChange={(e) => setNewMaintenance({...newMaintenance, fornecedor_id: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Valor Orçado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMaintenance.valor_orcado}
                    onChange={(e) => setNewMaintenance({...newMaintenance, valor_orcado: e.target.value})}
                    className="form-input"
                    placeholder="0,00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Responsável</label>
                  <input
                    type="text"
                    value={newMaintenance.responsavel}
                    onChange={(e) => setNewMaintenance({...newMaintenance, responsavel: e.target.value})}
                    className="form-input"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Observações</label>
                  <textarea
                    value={newMaintenance.observacoes}
                    onChange={(e) => setNewMaintenance({...newMaintenance, observacoes: e.target.value})}
                    rows={3}
                    className="form-input"
                    placeholder="Detalhes da manutenção..."
                  />
                </div>
              </div>
              <div className="form-actions premium-form-actions">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={createMaintenance}
                  className="btn btn-primary"
                >
                  Criar Manutenção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {maintenanceToDelete && (
        <div className="modal-overlay premium-modal">
          <div className="modal-content modal-fade" style={{ maxWidth: 500, width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmar Exclusão</h3>
              <button
                onClick={() => setMaintenanceToDelete(null)}
                className="modal-close"
                title="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                Tem certeza que deseja excluir a manutenção <b>{maintenanceToDelete.tag}</b> agendada para <b>{formatDate(maintenanceToDelete.data_agendada)}</b>?
              </p>
              <div className="form-actions premium-form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMaintenanceToDelete(null)}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteMaintenance(maintenanceToDelete.id)}
                  disabled={deleting}
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos premium rápidos (pode migrar para CSS depois) */}
      <style>{`
        .premium-header {
          background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
          border-radius: 18px;
          box-shadow: 0 6px 32px rgba(80,80,120,0.10);
          margin-bottom: 2rem;
          padding: 2rem 2.5rem 1.5rem 2.5rem;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .gradient-text {
          background: linear-gradient(90deg, #fff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .premium-card {
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(80,80,120,0.13);
          border: none;
          overflow: hidden;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%);
        }
        .premium-table {
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          font-size: 1rem;
        }
        .premium-table th {
          background: #f1f5f9;
          color: #6366f1;
          font-weight: 700;
          border-bottom: 2px solid #e0e7ff;
          padding: 1em 0.7em;
        }
        .premium-table td {
          padding: 0.9em 0.7em;
          border-bottom: 1px solid #e0e7ff;
        }
        .premium-row:nth-child(even) {
          background: #f8fafc;
        }
        .premium-row:hover {
          background: #e0e7ff44;
          transition: background 0.2s;
        }
        .premium-status-badge {
          border-radius: 16px;
          padding: 0.3em 1em 0.3em 0.7em;
          font-weight: 700;
          font-size: 0.95em;
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          background: linear-gradient(90deg, #e0e7ff 0%, #6366f1 100%);
          color: #3730a3;
          box-shadow: 0 2px 8px rgba(80,80,120,0.07);
          animation: badgePulse 2.5s infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(80,80,120,0.07); }
          50% { box-shadow: 0 4px 16px #6366f1aa; }
        }
        .premium-btn {
          box-shadow: 0 2px 8px #6366f122;
          border-radius: 8px;
          margin-right: 4px;
          transition: transform 0.12s, box-shadow 0.18s;
        }
        .premium-btn:active {
          transform: scale(0.96);
          box-shadow: 0 1px 2px #6366f122;
        }
        .premium-form-grid {
          gap: 1.5rem 2rem;
        }
        .premium-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1.2rem;
          margin-top: 1.5rem;
        }
        .premium-empty {
          text-align: center;
          color: #6366f1;
          padding: 2.5rem 0 1.5rem 0;
        }
        @media (max-width: 900px) {
          .premium-header { padding: 1.2rem 1rem; }
          .premium-card { padding: 1rem 0.5rem; }
          .premium-table th, .premium-table td { padding: 0.6em 0.3em; }
        }
      `}</style>
    </div>
  )
}

export default MaintenanceList