import React from 'react';
import StatusCard from './StatusCard';
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react';

export default function StatusOverviewWidget({ dashboardData }) {
  return (
    <div className="status-cards-modern">
      <StatusCard
        title="Operacional"
        value={dashboardData?.OK || 0}
        description="Equipamentos em operação normal"
        icon={<CheckCircle />}
        color="success"
      />
      <StatusCard
        title="Atenção"
        value={dashboardData?.AMARELO || 0}
        description="Equipamentos próximos do intervalo"
        icon={<AlertTriangle />}
        color="warning"
      />
      <StatusCard
        title="Crítico"
        value={dashboardData?.VERMELHO || 0}
        description="Equipamentos fora do intervalo"
        icon={<AlertTriangle />}
        color="danger"
      />
      <StatusCard
        title="Sem Intervalo"
        value={dashboardData?.SEM || 0}
        description="Equipamentos sem configuração"
        icon={<Settings />}
        color="info"
      />
    </div>
  );
} 