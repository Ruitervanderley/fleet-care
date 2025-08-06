import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function PriorityAlertsWidget({ equipmentList, loading }) {
  const criticalEquipment = useMemo(() =>
    (equipmentList || []).filter(equipment => {
      if (!equipment.intervalo || equipment.intervalo === 0) return false;
      const uso = equipment.atual - equipment.ultima_manut;
      const percentual = (uso / equipment.intervalo) * 100;
      return percentual >= 100;
    }),
    [equipmentList]
  );

  if (loading) {
    return (
      <div className="alerts-list">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="alert-item alert-skeleton" style={{ height: 48, marginBottom: 12, background: '#f3f4f6', borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (!criticalEquipment.length) {
    return (
      <div className="no-alerts">
        <CheckCircle size={48} />
        <h3>Nenhum Alerta Crítico</h3>
        <p>Todos os equipamentos estão dentro dos intervalos de manutenção</p>
      </div>
    );
  }

  return (
    <div className="alerts-list">
      {criticalEquipment.map(equipment => (
        <div key={equipment.tag} className="alert-item alert-danger">
          <AlertTriangle size={20} />
          <div>
            <strong>{equipment.tag}</strong>
            <div>
              {equipment.atual - equipment.ultima_manut} {equipment.tipo === 'KM' ? 'km' : 'horas'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 