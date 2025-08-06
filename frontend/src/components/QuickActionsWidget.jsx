import React from 'react';
import { BarChart3, Settings, Wrench, Cog } from 'lucide-react';

export default function QuickActionsWidget({
  onAnalysis,
  onConfig,
  onNewMaintenance,
  onSettings,
}) {
  return (
    <div className="actions-grid">
      <div 
        className="action-card analysis-card" 
        onClick={onAnalysis} 
        tabIndex={0} 
        role="button" 
        aria-label="Análise Detalhada"
      >
        <div className="action-icon">
          <BarChart3 size={24} />
        </div>
        <div className="action-content">
          <h3>Análise Detalhada</h3>
          <p>Visualize métricas avançadas e tendências da frota</p>
        </div>
      </div>
      
      <div 
        className="action-card config-card" 
        onClick={onConfig} 
        tabIndex={0} 
        role="button" 
        aria-label="Configurar Intervalos"
      >
        <div className="action-icon">
          <Settings size={24} />
        </div>
        <div className="action-content">
          <h3>Configurar Intervalos</h3>
          <p>Defina intervalos de manutenção personalizados</p>
        </div>
      </div>
      
      <div 
        className="action-card maintenance-card" 
        onClick={onNewMaintenance} 
        tabIndex={0} 
        role="button" 
        aria-label="Nova Manutenção"
      >
        <div className="action-icon">
          <Wrench size={24} />
        </div>
        <div className="action-content">
          <h3>Nova Manutenção</h3>
          <p>Registre uma nova manutenção no sistema</p>
        </div>
      </div>
      
      <div 
        className="action-card settings-card" 
        onClick={onSettings} 
        tabIndex={0} 
        role="button" 
        aria-label="Configurações"
      >
        <div className="action-icon">
          <Cog size={24} />
        </div>
        <div className="action-content">
          <h3>Personalizar Dashboard</h3>
          <p>Configure widgets e preferências do sistema</p>
        </div>
      </div>
    </div>
  );
} 