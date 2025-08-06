import React, { useState } from 'react'
import axios from 'axios'
import { Settings, Save, AlertCircle, Edit, Trash2, Plus, List } from 'lucide-react'

const IntervalConfig = ({ equipmentList, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('smart') // 'smart', 'edit', 'bulk'
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [interval, setInterval] = useState('')
  const [intervalType, setIntervalType] = useState('HORAS') // 'HORAS' ou 'KM'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingInterval, setEditingInterval] = useState(null)
  const [bulkConfig, setBulkConfig] = useState({
    vehicleType: '',
    interval: '',
    intervalType: 'HORAS'
  })

  // Função para detectar tipo de equipamento inteligentemente
  const detectEquipmentType = (equipment) => {
    const tag = equipment.tag?.toLowerCase() || ''
    const tipo = equipment.tipo?.toLowerCase() || ''
    
    // Palavras-chave para KM
    const kmKeywords = ['carro', 'camionete', 'pickup', 'van', 'hilux', 'ranger', 'l200', 'amarok', 'strada', 'saveiro', 'kombi']
    // Palavras-chave para HORAS
    const horasKeywords = ['escavadeira', 'trator', 'pa', 'carregadeira', 'retroescavadeira', 'compactador', 'gerador', 'motoniveladora', 'pá']
    
    const text = `${tag} ${tipo}`.toLowerCase()
    
    if (kmKeywords.some(keyword => text.includes(keyword))) {
      return { type: 'KM', suggestedInterval: 10000 }
    }
    
    if (horasKeywords.some(keyword => text.includes(keyword))) {
      return { type: 'HORAS', suggestedInterval: 250 }
    }
    
    // Se contém números grandes, provavelmente é KM
    if (equipment.atual > 5000) {
      return { type: 'KM', suggestedInterval: 10000 }
    }
    
    // Default para HORAS
    return { type: 'HORAS', suggestedInterval: 250 }
  }

  // Agrupar equipamentos por tipo detectado
  const groupedEquipment = equipmentList.reduce((acc, equipment) => {
    if (!equipment.intervalo || equipment.intervalo === 0) {
      const detected = detectEquipmentType(equipment)
      const group = detected.type
      if (!acc[group]) acc[group] = []
      acc[group].push({ ...equipment, detected })
    }
    return acc
  }, {})

  // Configurar um equipamento individual
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedEquipment || !interval) {
      setMessage('Selecione um equipamento e informe o intervalo')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`http://localhost:8000/equipment/${selectedEquipment}/interval`, null, {
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

  // Configurar intervalos em lote baseado no tipo
  const handleBulkConfig = async (type, interval) => {
    setLoading(true)
    setMessage('')
    
    const equipments = groupedEquipment[type] || []
    let successCount = 0
    let errorCount = 0
    
    for (const equipment of equipments) {
      try {
        await axios.post(`http://localhost:8000/equipment/${equipment.tag}/interval`, null, {
          params: { intervalo: parseFloat(interval) }
        })
        successCount++
      } catch (err) {
        errorCount++
        console.error(`Erro ao configurar ${equipment.tag}:`, err)
      }
    }
    
    setMessage(`✅ ${successCount} equipamentos configurados com sucesso! ${errorCount > 0 ? `❌ ${errorCount} falharam.` : ''}`)
    
    if (onUpdate) {
      setTimeout(onUpdate, 1000)
    }
    
    setLoading(false)
  }

  const handleEditInterval = async (equipment, newInterval) => {
    setLoading(true)
    setMessage('')
    try {
      await axios.put(`http://localhost:8000/equipment/${equipment.tag}/interval`, null, {
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
      await axios.delete(`http://localhost:8000/equipment/${equipment.tag}/interval`)
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
    <div className="interval-config-content">

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 24 }}>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'smart' ? 'active' : ''}`}
            onClick={() => setActiveTab('smart')}
          >
            <Settings size={16} />
            Configuração Inteligente
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
      {activeTab === 'smart' && (
        <div className="smart-config">
          <div className="smart-header">
            <h3>🤖 Configuração Inteligente de Intervalos</h3>
            <p>O sistema detectou automaticamente os tipos de equipamentos e sugere intervalos apropriados:</p>
          </div>

          {Object.entries(groupedEquipment).map(([type, equipments]) => (
            <div key={type} className="equipment-group">
              <div className="group-header">
                <h4>
                  {type === 'KM' ? '🚗 Veículos Leves' : '🚜 Equipamentos Pesados'} 
                  <span className="group-count">({equipments.length} equipamentos)</span>
                </h4>
                <p className="group-description">
                  {type === 'KM' 
                    ? 'Veículos leves como carros, camionetes e utilitários. Manutenção baseada em quilometragem.' 
                    : 'Equipamentos pesados como escavadeiras, tratores e máquinas. Manutenção baseada em horas de uso.'
                  }
                </p>
              </div>

              <div className="bulk-config">
                <div className="bulk-inputs">
                  <input
                    type="number"
                    placeholder={type === 'KM' ? '10000' : '250'}
                    className="form-input"
                    id={`bulk-${type}`}
                    defaultValue={type === 'KM' ? '10000' : '250'}
                  />
                  <span className="unit-label">{type === 'KM' ? 'km' : 'horas'}</span>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const input = document.getElementById(`bulk-${type}`)
                      handleBulkConfig(type, input.value)
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Configurando...' : 'Aplicar a Todos'}
                  </button>
                </div>
              </div>

              <div className="equipment-preview">
                <h5>Equipamentos que serão configurados:</h5>
                <div className="equipment-grid">
                  {equipments.slice(0, 6).map(equipment => (
                    <div key={equipment.tag} className="equipment-item">
                      <span className="equipment-tag">{equipment.tag}</span>
                      <span className="equipment-type">{equipment.tipo}</span>
                      <span className="suggested-interval">
                        Sugestão: {equipment.detected.suggestedInterval} {type.toLowerCase()}
                      </span>
                    </div>
                  ))}
                  {equipments.length > 6 && (
                    <div className="equipment-item more">
                      +{equipments.length - 6} mais...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {Object.keys(groupedEquipment).length === 0 && (
            <div className="empty-state">
              <h4>✅ Todos os equipamentos já têm intervalos configurados!</h4>
              <p>Use a aba "Editar Intervalos" para modificar configurações existentes.</p>
            </div>
          )}
        </div>
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