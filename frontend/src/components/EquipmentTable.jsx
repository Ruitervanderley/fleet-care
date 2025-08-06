import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Truck, Car, Clock, MapPin, History, Edit2, Save, X, Trash2 } from 'lucide-react'
import EquipmentHistoryModal from './EquipmentHistoryModal'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

const EquipmentTable = ({ equipmentList, filters = {} }) => {
  console.log('EquipmentTable - equipmentList:', equipmentList)
  console.log('EquipmentTable - filters:', filters)
  const [selectedTag, setSelectedTag] = useState(null)
  const [editingTag, setEditingTag] = useState(null)
  const [newInterval, setNewInterval] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [localEquipment, setLocalEquipment] = useState(equipmentList)
  const [successTag, setSuccessTag] = useState(null)
  const [editingAtualTag, setEditingAtualTag] = useState(null)
  const [newAtual, setNewAtual] = useState('')
  const [savingAtual, setSavingAtual] = useState(false)
  const [successAtualTag, setSuccessAtualTag] = useState(null)
  const [equipmentToDelete, setEquipmentToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Atualiza localEquipment se equipmentList mudar externamente
  React.useEffect(() => {
    setLocalEquipment(equipmentList)
  }, [equipmentList])

  if (!localEquipment || localEquipment.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <Truck size={64} />
          <h3>Nenhum equipamento cadastrado</h3>
          <p>Adicione o primeiro equipamento para começar a monitorar sua frota.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              // TODO: Implementar modal de adicionar equipamento
              alert('Funcionalidade de adicionar equipamento será implementada em breve!');
            }}
          >
            <Truck size={18} /> Adicionar Equipamento
          </button>
        </div>
      </div>
    )
  }

  const getPriorityClass = (equipment) => {
    if (!equipment.intervalo || equipment.intervalo === 0) return 'priority-info'
    
    const uso = equipment.atual - equipment.ultima_manut
    const percentual = (uso / equipment.intervalo) * 100
    
    if (percentual >= 100) return 'priority-danger'
    if (percentual >= 90) return 'priority-warning'
    return 'priority-ok'
  }

  const getPriorityText = (equipment) => {
    if (!equipment.intervalo || equipment.intervalo === 0) return 'SEM INTERVALO'
    
    const uso = equipment.atual - equipment.ultima_manut
    const percentual = (uso / equipment.intervalo) * 100
    
    if (percentual >= 100) return 'CRÍTICO'
    if (percentual >= 90) return 'ATENÇÃO'
    return 'OK'
  }

  const getEquipmentIcon = (tag) => {
    if (tag.includes('(KM)')) return <Car size={18} />
    return <Truck size={18} />
  }

  const getUnit = (tag) => {
    return tag.includes('(KM)') ? 'km' : 'horas'
  }

  const formatValue = (value, unit) => {
    if (!value) return '-'
    return `${value.toLocaleString('pt-BR')} ${unit}`
  }

  // Edição inline do intervalo
  const handleEditInterval = (tag, current) => {
    setEditingTag(tag)
    setNewInterval(current || '')
    setError('')
    setSuccessTag(null)
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
    setNewInterval('')
    setError('')
    setSuccessTag(null)
  }

  const handleSaveInterval = async (tag) => {
    if (!newInterval || isNaN(Number(newInterval)) || Number(newInterval) <= 0) {
      setError('Informe um valor válido para o intervalo')
      return
    }
    setSaving(true)
    setError('')
    try {
      await axios.post(`${API_BASE}/equipment/${tag}/interval`, null, {
        params: { intervalo: parseFloat(newInterval) }
      })
      setLocalEquipment(prev => prev.map(eq => eq.tag === tag ? { ...eq, intervalo: parseFloat(newInterval) } : eq))
      setEditingTag(null)
      setNewInterval('')
      setSuccessTag(tag)
      setTimeout(() => setSuccessTag(null), 2000)
    } catch (err) {
      setError('Erro ao salvar intervalo')
    } finally {
      setSaving(false)
    }
  }

  // Edição inline do valor atual
  const handleEditAtual = (tag, current) => {
    setEditingAtualTag(tag)
    setNewAtual(current || '')
    setSuccessAtualTag(null)
  }

  const handleCancelEditAtual = () => {
    setEditingAtualTag(null)
    setNewAtual('')
    setSuccessAtualTag(null)
  }

  const handleSaveAtual = async (tag) => {
    if (!newAtual || isNaN(Number(newAtual))) {
      setError('Informe um valor válido para o campo atual')
      return
    }
    setSavingAtual(true)
    setError('')
    try {
      await axios.post(`${API_BASE}/equipment/${tag}/atual`, null, {
        params: { atual: parseFloat(newAtual) }
      })
      setLocalEquipment(prev => prev.map(eq => eq.tag === tag ? { ...eq, atual: parseFloat(newAtual) } : eq))
      setEditingAtualTag(null)
      setNewAtual('')
      setSuccessAtualTag(tag)
      setTimeout(() => setSuccessAtualTag(null), 2000)
    } catch (err) {
      setError('Erro ao salvar valor atual')
    } finally {
      setSavingAtual(false)
    }
  }

  const deleteEquipment = async (tag) => {
    setDeleting(true)
    try {
      await axios.delete(`${API_BASE}/equipment/${tag}`)
      setEquipmentToDelete(null)
      setLocalEquipment(prev => prev.filter(eq => eq.tag !== tag))
    } catch (err) {
      console.error('Erro ao excluir equipamento:', err)
    } finally {
      setDeleting(false)
    }
  }

  // Aplicar filtros
  const filteredEquipment = localEquipment.filter(equipment => {
    // Filtro de busca
    if (filters.searchTerm && !equipment.tag.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }

    // Filtro de status
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      const priorityClass = getPriorityClass(equipment)
      const statusMap = {
        'critical': 'priority-danger',
        'warning': 'priority-warning', 
        'ok': 'priority-ok',
        'info': 'priority-info'
      }
      if (priorityClass !== statusMap[filters.statusFilter]) {
        return false
      }
    }

    // Filtro de tipo
    if (filters.typeFilter && filters.typeFilter !== 'all') {
      if (equipment.tipo !== filters.typeFilter) {
        return false
      }
    }

    return true
  })

  if (filteredEquipment.length === 0) {
    console.log('EquipmentTable - filteredEquipment vazio', filteredEquipment, filters)
    return (
      <div className="empty-state">
        <Truck size={64} />
        <h3>Nenhum equipamento encontrado</h3>
        <p>Tente ajustar os filtros para encontrar equipamentos</p>
      </div>
    )
  }

  return (
    <div className="equipment-container">
      {selectedTag && (
        <EquipmentHistoryModal tag={selectedTag} onClose={() => setSelectedTag(null)} />
      )}
      
      {equipmentToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o equipamento <b>{equipmentToDelete.tag}</b>?</p>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setEquipmentToDelete(null)}
                disabled={deleting}
              >Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteEquipment(equipmentToDelete.tag)}
                disabled={deleting}
              >{deleting ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="table-info">
        Mostrando {filteredEquipment.length} de {localEquipment.length} equipamentos
      </div>
      
      {/* Versão Desktop - Tabela */}
      <div className="table-container">
        <table className="equipment-table">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Tipo</th>
            <th>Última Manutenção</th>
            <th>Atual</th>
            <th>Intervalo</th>
            <th>Uso</th>
            <th>Próxima Manutenção</th>
            <th>Última Atualização</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipment.map((equipment) => {
            const unit = getUnit(equipment.tag)
            const uso = (equipment.atual || equipment.ultima_manut) - equipment.ultima_manut
            const proxima = equipment.ultima_manut + equipment.intervalo
            const isEditing = editingTag === equipment.tag
            
            return (
              <tr key={equipment.tag}>
                <td>
                  <div className="equipment-info">
                    <div className="equipment-icon">
                      {getEquipmentIcon(equipment.tag)}
                    </div>
                    <div className="equipment-details">
                      <strong className="equipment-tag">{equipment.tag}</strong>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="type-info">
                    <div className="type-icon">
                      {equipment.tipo === 'KM' ? <MapPin size={16} /> : <Clock size={16} />}
                    </div>
                    <span className="type-text">{equipment.tipo}</span>
                  </div>
                </td>
                <td className="value-cell">{formatValue(equipment.ultima_manut, unit)}</td>
                <td className="value-cell">
                  {editingAtualTag === equipment.tag ? (
                    <div className="inline-edit">
                      <input
                        type="number"
                        className="form-input"
                        value={newAtual}
                        onChange={e => setNewAtual(e.target.value)}
                        min={0}
                        disabled={savingAtual}
                      />
                      <button className="btn btn-success btn-sm" onClick={() => handleSaveAtual(equipment.tag)} disabled={savingAtual} title="Salvar">
                        <Save size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancelEditAtual} disabled={savingAtual} title="Cancelar">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="inline-display">
                      {formatValue(equipment.atual, unit)}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditAtual(equipment.tag, equipment.atual)} title="Editar valor atual">
                        <Edit2 size={14} />
                      </button>
                      {successAtualTag === equipment.tag && (
                        <span className="success-check">✓</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="value-cell">
                  {isEditing ? (
                    <div className="inline-edit">
                      <input
                        type="number"
                        className="form-input"
                        value={newInterval}
                        onChange={e => setNewInterval(e.target.value)}
                        min={1}
                        disabled={saving}
                      />
                      <button className="btn btn-success btn-sm" onClick={() => handleSaveInterval(equipment.tag)} disabled={saving} title="Salvar">
                        <Save size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit} disabled={saving} title="Cancelar">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="inline-display">
                      {formatValue(equipment.intervalo, unit)}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditInterval(equipment.tag, equipment.intervalo)} title="Editar intervalo">
                        <Edit2 size={14} />
                      </button>
                      {successTag === equipment.tag && (
                        <span className="success-check">✓</span>
                      )}
                    </div>
                  )}
                  {isEditing && error && (
                    <div className="error-message">{error}</div>
                  )}
                </td>
                <td className="value-cell">{formatValue(uso, unit)}</td>
                <td className="value-cell">
                  {equipment.intervalo > 0 ? formatValue(proxima, unit) : '-'}
                </td>
                <td className="date-cell">
                  {equipment.ultima_atualizacao ?
                    format(new Date(equipment.ultima_atualizacao), "dd/MM/yyyy", { locale: ptBR }) :
                    '-'
                  }
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(equipment)}`}>
                    {getPriorityText(equipment)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedTag(equipment.tag)}
                      title="Ver histórico do equipamento"
                    >
                      <History size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      title="Excluir equipamento"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEquipmentToDelete(equipment)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        </table>
      </div>

      {/* Versão Mobile/Tablet - Cards */}
      <div className="equipment-cards">
        {filteredEquipment.map((equipment) => {
          const unit = getUnit(equipment.tag)
          const uso = (equipment.atual || equipment.ultima_manut) - equipment.ultima_manut
          const proxima = equipment.ultima_manut + equipment.intervalo
          
          return (
            <div key={equipment.tag} className="equipment-card">
              <div className="equipment-card-header">
                <div className="equipment-card-title">
                  <div className="equipment-icon">
                    {getEquipmentIcon(equipment.tag)}
                  </div>
                  <div>
                    <div className="equipment-card-tag">{equipment.tag}</div>
                    <div className="equipment-card-type">
                      {equipment.tipo === 'KM' ? <MapPin size={14} /> : <Clock size={14} />}
                      {equipment.tipo}
                    </div>
                  </div>
                </div>
                <div className="equipment-card-status">
                  <span className={`priority-badge ${getPriorityClass(equipment)}`}>
                    {getPriorityText(equipment)}
                  </span>
                </div>
              </div>

              <div className="equipment-card-content">
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Última Manutenção</div>
                  <div className="equipment-card-value">{formatValue(equipment.ultima_manut, unit)}</div>
                </div>
                
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Atual</div>
                  <div className="equipment-card-value">{formatValue(equipment.atual, unit)}</div>
                </div>
                
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Intervalo</div>
                  <div className="equipment-card-value">{formatValue(equipment.intervalo, unit)}</div>
                </div>
                
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Uso</div>
                  <div className="equipment-card-value">{formatValue(uso, unit)}</div>
                </div>
                
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Próxima Manutenção</div>
                  <div className="equipment-card-value">
                    {equipment.intervalo > 0 ? formatValue(proxima, unit) : '-'}
                  </div>
                </div>
                
                <div className="equipment-card-field">
                  <div className="equipment-card-label">Última Atualização</div>
                  <div className="equipment-card-value">
                    {equipment.ultima_atualizacao ?
                      format(new Date(equipment.ultima_atualizacao), "dd/MM/yyyy", { locale: ptBR }) :
                      '-'
                    }
                  </div>
                </div>
              </div>

              <div className="equipment-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedTag(equipment.tag)}
                  title="Ver histórico do equipamento"
                >
                  <History size={14} />
                  Histórico
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  title="Excluir equipamento"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEquipmentToDelete(equipment)
                  }}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EquipmentTable