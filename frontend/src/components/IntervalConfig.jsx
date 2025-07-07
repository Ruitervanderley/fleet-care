import React, { useState } from 'react'
import axios from 'axios'
import { Settings, Save, AlertCircle, Edit, Trash2, Plus, List } from 'lucide-react'

const IntervalConfig = ({ equipmentList, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('new') // 'new' ou 'edit'
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [interval, setInterval] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingInterval, setEditingInterval] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedEquipment || !interval) {
      setMessage('Selecione um equipamento e informe o intervalo')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`/api/equipment/${selectedEquipment}/interval`, null, {
        params: { intervalo: parseFloat(interval) }
      })
      setMessage('✅ Intervalo configurado com sucesso!')
      setSelectedEquipment('')
      setInterval('')
      if (onUpdate) {
        setTimeout(onUpdate, 1000)
      }
    } catch (err) {
      setMessage('❌ Erro ao configurar intervalo: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEditInterval = async (equipment, newInterval) => {
    setLoading(true)
    setMessage('')
    try {
      await axios.put(`/api/equipment/${equipment.tag}/interval`, null, {
        params: { intervalo: parseFloat(newInterval) }
      })
      setMessage('✅ Intervalo atualizado com sucesso!')
      setEditingInterval(null)
      if (onUpdate) {
        setTimeout(onUpdate, 1000)
      }
    } catch (err) {
      setMessage('❌ Erro ao atualizar intervalo: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInterval = async (equipment) => {
    if (!confirm(`Tem certeza que deseja remover o intervalo do equipamento ${equipment.tag}?`)) {
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await axios.delete(`/api/equipment/${equipment.tag}/interval`)
      setMessage('✅ Intervalo removido com sucesso!')
      if (onUpdate) {
        setTimeout(onUpdate, 1000)
      }
    } catch (err) {
      setMessage('❌ Erro ao remover intervalo: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const getSuggestedInterval = (tag) => {
    if (tag.includes('(KM)')) {
      return '5000'
    }
    return '250'
  }

  const handleEquipmentChange = (e) => {
    const tag = e.target.value
    setSelectedEquipment(tag)
    if (tag) {
      setInterval(getSuggestedInterval(tag))
    }
  }

  const startEditing = (equipment) => {
    setEditingInterval({
      tag: equipment.tag,
      currentInterval: equipment.intervalo,
      newInterval: equipment.intervalo.toString()
    })
  }

  const cancelEditing = () => {
    setEditingInterval(null)
    setMessage('')
  }

  const equipmentWithIntervals = equipmentList.filter(eq => eq.intervalo && eq.intervalo > 0)
  const equipmentWithoutIntervals = equipmentList.filter(eq => !eq.intervalo || eq.intervalo === 0)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Settings size={20} />
          Gerenciar Intervalos de Manutenção
        </h2>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 24 }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <Plus size={16} />
            Novo Intervalo
          </button>
          <button
            className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <List size={16} />
            Editar Intervalos ({equipmentWithIntervals.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: 500, margin: '0 auto', gap: 24 }}>
          <div className="form-group">
            <label className="form-label">Equipamento:</label>
            <select 
              value={selectedEquipment}
              onChange={handleEquipmentChange}
              className="form-select"
            >
              <option value="">Selecione um equipamento</option>
              {equipmentWithoutIntervals.map(eq => (
                <option key={eq.tag} value={eq.tag}>
                  {eq.tag} ({eq.tipo})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Intervalo de Manutenção:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                placeholder="Ex: 250 horas ou 5000 km"
                className="form-input"
                min={1}
                disabled={loading}
                style={{ maxWidth: 160 }}
              />
              <span style={{ color: '#718096', fontSize: 14 }}>
                {selectedEquipment.includes('(KM)') ? 'km' : 'horas'}
              </span>
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading || !selectedEquipment || !interval}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{ marginRight: 8 }}>553</span>
                  Configurando...
                </>
              ) : (
                <>
                  <Save size={16} style={{ marginRight: 8 }} />
                  Configurar Intervalo
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'edit' && (
        <div className="intervals-list">
          {equipmentWithIntervals.length === 0 ? (
            <div className="empty-state">
              <Settings size={48} />
              <h3>Nenhum intervalo configurado</h3>
              <p>Configure intervalos na aba "Novo Intervalo"</p>
            </div>
          ) : (
            <div className="intervals-grid">
              {equipmentWithIntervals.map(equipment => (
                <div key={equipment.tag} className="interval-card">
                  {editingInterval?.tag === equipment.tag ? (
                    <div className="interval-edit-form">
                      <div className="interval-header">
                        <h4>{equipment.tag}</h4>
                        <span className="equipment-type">{equipment.tipo}</span>
                      </div>
                      <div className="interval-input-group">
                        <label>Novo Intervalo:</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="number"
                            value={editingInterval.newInterval}
                            onChange={(e) => setEditingInterval({
                              ...editingInterval,
                              newInterval: e.target.value
                            })}
                            className="form-input"
                            min={1}
                            style={{ maxWidth: 120 }}
                          />
                          <span style={{ color: '#718096', fontSize: 14 }}>
                            {equipment.tag.includes('(KM)') ? 'km' : 'horas'}
                          </span>
                        </div>
                      </div>
                      <div className="interval-actions">
                        <button
                          onClick={() => handleEditInterval(equipment, editingInterval.newInterval)}
                          disabled={loading}
                          className="btn btn-success btn-sm"
                        >
                          {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={loading}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="interval-display">
                      <div className="interval-header">
                        <h4>{equipment.tag}</h4>
                        <span className="equipment-type">{equipment.tipo}</span>
                      </div>
                      <div className="interval-info">
                        <div className="interval-value">
                          <span className="label">Intervalo Atual:</span>
                          <span className="value">
                            {equipment.intervalo} {equipment.tag.includes('(KM)') ? 'km' : 'horas'}
                          </span>
                        </div>
                        <div className="interval-usage">
                          <span className="label">Uso Atual:</span>
                          <span className="value">
                            {equipment.atual} {equipment.tag.includes('(KM)') ? 'km' : 'horas'}
                          </span>
                        </div>
                        <div className="interval-progress">
                          <span className="label">Progresso:</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min((equipment.atual - equipment.ultima_manut) / equipment.intervalo * 100, 100)}%`,
                                backgroundColor: (equipment.atual - equipment.ultima_manut) / equipment.intervalo > 1 ? '#ef4444' : 
                                                (equipment.atual - equipment.ultima_manut) / equipment.intervalo > 0.8 ? '#f59e0b' : '#10b981'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="interval-actions">
                        <button
                          onClick={() => startEditing(equipment)}
                          className="btn btn-primary btn-sm"
                          title="Editar intervalo"
                        >
                          <Edit size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteInterval(equipment)}
                          className="btn btn-danger btn-sm"
                          title="Remover intervalo"
                        >
                          <Trash2 size={14} />
                          Remover
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`alert-item ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`} style={{ justifyContent: 'center', fontWeight: 600, marginTop: 24 }}>
          {message.includes('✅') ? <Settings size={16} /> : <AlertCircle size={16} />} {message}
        </div>
      )}

      {/* Tips */}
      <div className="card" style={{ marginTop: 24, background: 'var(--secondary-bg)' }}>
        <div className="card-header" style={{ borderBottom: 'none', background: 'none', paddingBottom: 0 }}>
          <h4 className="card-title" style={{ fontSize: 16, marginBottom: 0 }}>💡 Dicas:</h4>
        </div>
        <div style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontSize: 14 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Máquinas e caminhões: 250-500 horas</li>
            <li>Veículos leves: 5000-10000 km</li>
            <li>Equipamentos críticos: intervalos menores</li>
            <li>Consulte o manual do fabricante</li>
            <li>Você pode editar intervalos a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default IntervalConfig 