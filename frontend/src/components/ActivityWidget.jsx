import React from 'react';
import { Truck, Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ActivityWidget = () => {
  // Simulação de atividades em tempo real
  const activities = [
    {
      id: 1,
      type: 'maintenance',
      title: 'Manutenção preventiva iniciada',
      description: 'Equipamento TR-001 em manutenção',
      time: '2 min atrás',
      icon: <Wrench size={16} />
    },
    {
      id: 2,
      type: 'alert',
      title: 'Alerta de intervalo',
      description: 'TR-005 próximo ao limite',
      time: '5 min atrás',
      icon: <AlertTriangle size={16} />
    },
    {
      id: 3,
      type: 'completed',
      title: 'Manutenção concluída',
      description: 'TR-003 finalizada com sucesso',
      time: '12 min atrás',
      icon: <CheckCircle size={16} />
    },
    {
      id: 4,
      type: 'schedule',
      title: 'Agendamento criado',
      description: 'Nova manutenção para TR-008',
      time: '15 min atrás',
      icon: <Clock size={16} />
    }
  ];

  const getActivityColor = (type) => {
    switch (type) {
      case 'maintenance': return '#3b82f6';
      case 'alert': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'schedule': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="activity-widget widget-hover-effect">
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>Atividade em Tempo Real</h3>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ backgroundColor: getActivityColor(activity.type) }}
            >
              {activity.icon}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{activity.description}</div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityWidget; 