import React from 'react'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

const MaintenanceAlert = ({ equipmentList }) => {
  const getCriticalEquipment = () => {
    if (!equipmentList) return []
    return equipmentList.filter(equipment => {
      if (!equipment.intervalo || equipment.intervalo === 0) return false
      const uso = equipment.atual - equipment.ultima_manut
      const percentual = (uso / equipment.intervalo) * 100
      return percentual >= 90
    }).sort((a, b) => {
      const usoA = a.atual - a.ultima_manut
      const usoB = b.atual - b.ultima_manut
      const percentualA = (usoA / a.intervalo) * 100
      const percentualB = (usoB / b.intervalo) * 100
      return percentualB - percentualA
    })
  }

  const criticalEquipment = getCriticalEquipment()

  if (criticalEquipment.length === 0) {
    return (
      <div className="card card-alert">
        <div className="card-header">
          <h2 className="card-title">
            <CheckCircle size={20} className="text-success" />
            Alertas de Manutenção
          </h2>
        </div>
        <div className="alert-list">
          <div className="alert-item alert-success" style={{ justifyContent: 'center' }}>
            ✅ Nenhum equipamento precisa de manutenção imediata
          </div>
        </div>
      </div>
    )
  }

  const getAlertType = (equipment) => {
    const uso = equipment.atual - equipment.ultima_manut
    const percentual = (uso / equipment.intervalo) * 100
    if (percentual >= 100) return 'danger'
    return 'warning'
  }

  const getAlertMessage = (equipment) => {
    const uso = equipment.atual - equipment.ultima_manut
    const percentual = (uso / equipment.intervalo) * 100
    const unit = equipment.tag.includes('(KM)') ? 'km' : 'horas'
    if (percentual >= 100) {
      return `CRÍTICO: ${equipment.tag} está ${percentual.toFixed(1)}% acima do intervalo de manutenção!`
    } else {
      return `ATENÇÃO: ${equipment.tag} está a ${percentual.toFixed(1)}% do intervalo de manutenção`
    }
  }

  const getDaysUntilMaintenance = (equipment) => {
    const uso = equipment.atual - equipment.ultima_manut
    const proxima = equipment.ultima_manut + equipment.intervalo
    const atual = equipment.atual
    const restante = proxima - atual
    const unit = equipment.tag.includes('(KM)') ? 'km' : 'horas'
    const usoDiario = unit === 'km' ? 100 : 8
    const dias = Math.ceil(restante / usoDiario)
    return dias
  }

  return (
    <div className="card card-alert">
      <div className="card-header">
        <h2 className="card-title">
          <AlertTriangle size={20} className="text-warning" />
          Alertas de Manutenção
        </h2>
        <span className="priority-badge priority-warning">
          {criticalEquipment.length} equipamento(s) precisam de atenção
        </span>
      </div>
      <div className="alert-list">
        {criticalEquipment.map((equipment) => {
          const alertType = getAlertType(equipment)
          const daysUntil = getDaysUntilMaintenance(equipment)
          return (
            <div 
              key={equipment.tag}
              className={`alert-item alert-${alertType}`}
            >
              <div style={{ flex: 1 }}>
                <div className="alert-item-desc" style={{ fontWeight: 600 }}>
                  {getAlertMessage(equipment)}
                </div>
                <div className="alert-item-desc" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} />
                  {daysUntil > 0 ? `Aproximadamente ${daysUntil} dias até a manutenção` : 'Manutenção necessária imediatamente'}
                </div>
              </div>
              <div className="priority-badge" style={{ background: alertType === 'danger' ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : 'linear-gradient(135deg, #fef3c7, #fde68a)', color: alertType === 'danger' ? '#b91c1c' : '#b45309', fontWeight: 700 }}>
                {alertType === 'danger' ? 'Crítico' : 'Atenção'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MaintenanceAlert 