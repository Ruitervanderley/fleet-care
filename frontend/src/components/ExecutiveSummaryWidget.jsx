import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Users, Calendar, Wrench } from 'lucide-react';

export default function ExecutiveSummaryWidget({ dashboardData, equipmentList }) {
  const metrics = useMemo(() => {
    const total = equipmentList?.length || 0;
    const ok = dashboardData?.OK || 0;
    const amarelo = dashboardData?.AMARELO || 0;
    const vermelho = dashboardData?.VERMELHO || 0;
    const sem = dashboardData?.SEM || 0;
    
    const operacional = total > 0 ? Math.round((ok / total) * 100) : 0;
    const configurados = total - sem;
    const percConfigurados = total > 0 ? Math.round((configurados / total) * 100) : 0;
    const criticosUrgentes = vermelho + amarelo;
    
    return {
      total,
      operacional,
      percConfigurados,
      criticosUrgentes,
      configurados
    };
  }, [dashboardData, equipmentList]);

  return (
    <div className="executive-summary">
      <div className="executive-header">
        <h3>📊 Resumo Executivo</h3>
        <span className="update-badge">Atualizado: {dashboardData?.ultima_atualizacao || 'Nunca'}</span>
      </div>
      
      <div className="executive-grid">
        <div className="metric-card metric-primary">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <h4>Total de Equipamentos</h4>
            <div className="metric-value">{metrics.total}</div>
            <span className="metric-label">Frota Completa</span>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <h4>Taxa Operacional</h4>
            <div className="metric-value">{metrics.operacional}%</div>
            <div className="metric-trend trend-positive">
              <TrendingUp size={14} />
              <span>Dentro do intervalo</span>
            </div>
          </div>
        </div>

        <div className="metric-card metric-info">
          <div className="metric-icon">
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <h4>Configuração</h4>
            <div className="metric-value">{metrics.percConfigurados}%</div>
            <span className="metric-label">{metrics.configurados} de {metrics.total} configurados</span>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon">
            <Wrench size={24} />
          </div>
          <div className="metric-content">
            <h4>Ação Necessária</h4>
            <div className="metric-value">{metrics.criticosUrgentes}</div>
            <div className="metric-trend trend-warning">
              <TrendingDown size={14} />
              <span>Requer manutenção</span>
            </div>
          </div>
        </div>
      </div>
      
      {metrics.total === 0 && (
        <div className="empty-state">
          <Activity size={48} />
          <h4>Nenhum Equipamento Encontrado</h4>
          <p>Importe dados da planilha para começar</p>
        </div>
      )}
    </div>
  );
} 