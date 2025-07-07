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
    console.log('EquipmentTable - localEquipment vazio')
    return (
      <div style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, background: '#fff', padding: 0, marginBottom: 32, overflowX: 'auto'}}>
        {(!localEquipment || localEquipment.length === 0) ? (
          <div className="empty-state" style={{padding: 48, textAlign: 'center'}}>
            <Truck size={64} />
            <h3 style={{marginTop: 16}}>Nenhum equipamento cadastrado</h3>
            <p>Adicione o primeiro equipamento para começar a monitorar sua frota.</p>
            <button className="btn btn-primary" style={{fontSize: 18, padding: '12px 28px', marginTop: 16}} title="Adicionar Equipamento">
              <Truck size={18} style={{marginRight: 8}} /> Adicionar Equipamento
            </button>
          </div>
        ) : (
          <table className="equipment-table" style={{width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 800}}>
            <thead style={{background: '#f3f4f6'}}>
              <tr>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5', borderTopLeftRadius: 16}}>Tag</th>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5'}}>Tipo</th>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5'}}>Intervalo</th>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5'}}>Última Manut.</th>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5'}}>Atual</th>
                <th style={{padding: '16px 12px', fontWeight: 700, fontSize: 16, color: '#4f46e5'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((equipment, idx) => (
                <tr key={equipment.tag} style={{background: idx % 2 === 0 ? '#fff' : '#f9fafb', transition: 'background 0.2s'}}>
                  <td style={{padding: '14px 12px', fontWeight: 600}}>{equipment.tag}</td>
                  <td style={{padding: '14px 12px'}}>{equipment.tipo}</td>
                  <td style={{padding: '14px 12px'}}>{equipment.intervalo || '-'}</td>
                  <td style={{padding: '14px 12px'}}>{equipment.ultima_manut}</td>
                  <td style={{padding: '14px 12px'}}>{equipment.atual}</td>
                  <td style={{padding: '14px 12px'}}>
                    {/* Aqui vão os botões de ação existentes */}
                    {/* ... existing code ... */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    <div style={{ overflowX: 'auto' }}>
      {selectedTag && (
        <EquipmentHistoryModal tag={selectedTag} onClose={() => setSelectedTag(null)} />
      )}
      
      {equipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md modal-fade" style={{ boxShadow: '0 4px 32px #0004' }}>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirmar Exclusão</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Tem certeza que deseja excluir o equipamento <b>{equipmentToDelete.tag}</b>?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setEquipmentToDelete(null)}
                disabled={deleting}
              >Cancelar</button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 100 }}
                        value={newAtual}
                        onChange={e => setNewAtual(e.target.value)}
                        min={0}
                        disabled={savingAtual}
                      />
                      <span style={{ color: '#718096', fontSize: 13 }}>{unit}</span>
                      <button className="btn btn-success btn-sm" onClick={() => handleSaveAtual(equipment.tag)} disabled={savingAtual} title="Salvar">
                        <Save size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancelEditAtual} disabled={savingAtual} title="Cancelar">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {formatValue(equipment.atual, unit)}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditAtual(equipment.tag, equipment.atual)} title="Editar valor atual">
                        <Edit2 size={14} />
                      </button>
                      {successAtualTag === equipment.tag && (
                        <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 6, fontSize: 13 }}>✓</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="value-cell">
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 80 }}
                        value={newInterval}
                        onChange={e => setNewInterval(e.target.value)}
                        min={1}
                        disabled={saving}
                      />
                      <span style={{ color: '#718096', fontSize: 13 }}>{unit}</span>
                      <button className="btn btn-success btn-sm" onClick={() => handleSaveInterval(equipment.tag)} disabled={saving} title="Salvar">
                        <Save size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit} disabled={saving} title="Cancelar">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {formatValue(equipment.intervalo, unit)}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditInterval(equipment.tag, equipment.intervalo)} title="Editar intervalo">
                        <Edit2 size={14} />
                      </button>
                      {successTag === equipment.tag && (
                        <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 6, fontSize: 13 }}>✓</span>
                      )}
                    </div>
                  )}
                  {isEditing && error && (
                    <div style={{ color: '#e53e3e', fontSize: 12, marginTop: 2 }}>{error}</div>
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
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTag(equipment.tag)}
                    title="Ver histórico do equipamento"
                  >
                    <History size={14} />
                    <span>Histórico</span>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: 6 }}
                    title="Excluir equipamento"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEquipmentToDelete(equipment)
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Estilos premium rápidos (pode migrar para CSS depois)
const style = document.createElement('style');
style.innerHTML = `
  .equipment-table {
    border-radius: 14px;
    overflow: hidden;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
    font-size: 1rem;
    box-shadow: 0 8px 32px rgba(80,80,120,0.10);
    margin-bottom: 2rem;
  }
  .equipment-table th {
    background: #f1f5f9;
    color: #6366f1;
    font-weight: 700;
    border-bottom: 2px solid #e0e7ff;
    padding: 1em 0.7em;
  }
  .equipment-table td {
    padding: 0.9em 0.7em;
    border-bottom: 1px solid #e0e7ff;
  }
  .equipment-table tr:nth-child(even) {
    background: #f8fafc;
  }
  .equipment-table tr:hover {
    background: #e0e7ff44;
    transition: background 0.2s;
  }
  .priority-badge {
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
  .priority-danger {
    background: linear-gradient(90deg, #fee2e2 0%, #ef4444 100%);
    color: #b91c1c;
  }
  .priority-warning {
    background: linear-gradient(90deg, #fef3c7 0%, #f59e0b 100%);
    color: #b45309;
  }
  .priority-ok {
    background: linear-gradient(90deg, #d1fae5 0%, #10b981 100%);
    color: #065f46;
  }
  .priority-info {
    background: linear-gradient(90deg, #dbeafe 0%, #3b82f6 100%);
    color: #1e40af;
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 2px 8px rgba(80,80,120,0.07); }
    50% { box-shadow: 0 4px 16px #6366f1aa; }
  }
  .equipment-info {
    display: flex;
    align-items: center;
    gap: 0.7em;
  }
  .equipment-icon {
    background: linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%);
    color: #fff;
    border-radius: 10px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    box-shadow: 0 2px 8px #6366f122;
  }
  .equipment-tag {
    font-size: 1.08em;
    font-weight: 700;
    color: #3730a3;
  }
  .type-info {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .type-icon {
    color: #6366f1;
  }
  .btn.btn-secondary.btn-sm, .btn.btn-success.btn-sm, .btn.btn-danger.btn-sm {
    box-shadow: 0 2px 8px #6366f122;
    border-radius: 8px;
    margin-right: 4px;
    transition: transform 0.12s, box-shadow 0.18s;
  }
  .btn.btn-secondary.btn-sm:active, .btn.btn-success.btn-sm:active, .btn.btn-danger.btn-sm:active {
    transform: scale(0.96);
    box-shadow: 0 1px 2px #6366f122;
  }
  @media (max-width: 900px) {
    .equipment-table th, .equipment-table td { padding: 0.6em 0.3em; }
    .equipment-icon { width: 28px; height: 28px; }
  }
`;
document.head.appendChild(style);

export default EquipmentTable