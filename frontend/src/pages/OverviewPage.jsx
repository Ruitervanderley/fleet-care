import React, { useMemo } from 'react';
import { Settings, Cog, RefreshCw, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import StatusCard from '../components/StatusCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useEquipmentList } from '../hooks/useEquipmentList';
import WidgetFrame from '../components/WidgetFrame';
import ExecutiveSummaryWidget from '../components/ExecutiveSummaryWidget';
import PriorityAlertsWidget from '../components/PriorityAlertsWidget';
import StatusOverviewWidget from '../components/StatusOverviewWidget';
import QuickActionsWidget from '../components/QuickActionsWidget';

export default function OverviewPage({
  widgets,
  setShowIntervalModal,
  setShowWidgetSettings,
  setWidgets,
  setShowMaintenanceModal,
  setActiveTab,
  // ... outros handlers e props
}) {
  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardData();
  const { data: equipmentList, isLoading: loadingEquipment } = useEquipmentList();
  const { showSuccess, showError, showInfo } = useToast();

  // Função para exportar dados
  const handleExportData = async () => {
    try {
      showInfo('Iniciando exportação dos dados...');
      const response = await fetch('http://localhost:8000/export', {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fleet_care_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showSuccess('Dados exportados com sucesso!');
      } else {
        showError('Erro ao exportar dados do servidor');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showError('Erro ao exportar dados. Tente novamente.');
    }
  };

  // Função para importar planilha
  const handleImportData = async () => {
    try {
      showInfo('Iniciando importação da planilha...');
      const response = await fetch('http://localhost:8000/import', {
        method: 'GET',
      });
      
      if (response.ok) {
        showSuccess('Importação iniciada! Os dados serão atualizados em breve.');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showError('Erro ao importar dados do servidor');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      showError('Erro ao importar dados. Tente novamente.');
    }
  };

  const visibleWidgets = useMemo(
    () => widgets.filter(w => w.visible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  // Progressive loading: skeleton global
  if (loadingDashboard || loadingEquipment) {
    return <div className="dashboard-skeleton">Carregando dashboard...</div>;
  }

  return (
    <section className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-title">
            <h1>Visão Geral da Frota</h1>
            <p>Monitoramento inteligente e gestão proativa dos equipamentos</p>
          </div>
          <div className="hero-update-badge">
            <span className="update-label">Última atualização:</span>
            <span className="update-time">{dashboardData?.ultima_atualizacao || 'Nunca'}</span>
          </div>
        </div>
        <div className="hero-actions">
          <div className="action-group primary-actions">
            <button className="btn btn-primary" onClick={() => setShowIntervalModal(true)}>
              <Settings size={16} />
              Configurar Intervalos
            </button>
            <button className="btn btn-success" onClick={handleImportData}>
              <Upload size={16} />
              Importar Planilha
            </button>
          </div>
          <div className="action-group secondary-actions">
            <button className="btn btn-secondary" onClick={handleExportData}>
              <Download size={16} />
              Exportar Dados
            </button>
            <button className="btn btn-secondary" onClick={() => setShowWidgetSettings(true)}>
              <Cog size={16} />
              Personalizar
            </button>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Renderização dos widgets */}
      {visibleWidgets.map(widget => (
        <WidgetFrame key={widget.id} title={widget.title}>
          {widget.type === 'executive-summary' && (
            <ExecutiveSummaryWidget dashboardData={dashboardData} equipmentList={equipmentList} />
          )}
          {widget.type === 'priority-alerts' && (
            <PriorityAlertsWidget equipmentList={equipmentList} loading={loadingEquipment} />
          )}
          {widget.type === 'status-overview' && (
            <StatusOverviewWidget dashboardData={dashboardData} />
          )}
          {widget.type === 'quick-actions' && (
            <QuickActionsWidget
              onAnalysis={() => setActiveTab('analysis')}
              onConfig={() => setShowIntervalModal(true)}
              onNewMaintenance={() => setShowMaintenanceModal(true)}
              onSettings={() => setShowWidgetSettings(true)}
            />
          )}
        </WidgetFrame>
      ))}
    </section>
  );
} 