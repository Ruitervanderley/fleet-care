import React, { useState } from 'react';
import { X, Eye, EyeOff, Move, Settings, Layout } from 'lucide-react';

const WidgetSettingsModal = ({ isOpen, onClose, widgets, setWidgets }) => {
  const [activeTab, setActiveTab] = useState('widgets');

  if (!isOpen) return null;

  const handleWidgetToggle = (widgetId) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  };

  const handleWidgetOrder = (widgetId, direction) => {
    setWidgets(prevWidgets => {
      const currentIndex = prevWidgets.findIndex(w => w.id === widgetId);
      const newWidgets = [...prevWidgets];
      
      if (direction === 'up' && currentIndex > 0) {
        [newWidgets[currentIndex], newWidgets[currentIndex - 1]] = 
        [newWidgets[currentIndex - 1], newWidgets[currentIndex]];
      } else if (direction === 'down' && currentIndex < newWidgets.length - 1) {
        [newWidgets[currentIndex], newWidgets[currentIndex + 1]] = 
        [newWidgets[currentIndex + 1], newWidgets[currentIndex]];
      }
      
      return newWidgets.map((widget, index) => ({ ...widget, order: index }));
    });
  };

  const widgetTypes = {
    'executive-summary': { name: 'Resumo Executivo', icon: '📊', description: 'Métricas executivas e KPIs principais' },
    'priority-alerts': { name: 'Alertas Prioritários', icon: '⚠️', description: 'Alertas críticos e notificações importantes' },
    'status-overview': { name: 'Status da Frota', icon: '🚗', description: 'Visão geral do status dos equipamentos' },
    'quick-actions': { name: 'Ações Rápidas', icon: '⚡', description: 'Acesso rápido às funcionalidades principais' }
  };

  return (
    <div className="modal-overlay-new">
      <div className="modal-content-new modal-large widget-settings-modal">
        <div className="modal-header-new">
          <div className="modal-title-new">
            <Settings size={24} />
            Personalizar Dashboard
          </div>
          <button className="modal-close-new" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'widgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('widgets')}
          >
            <Layout size={16} />
            Widgets
          </button>
        </div>

        <div className="modal-body-new">
          <div className="widgets-config">
            <h3>Configurar Widgets</h3>
            <p className="config-description">
              Ative ou desative widgets e reorganize a ordem de exibição
            </p>
            
            <div className="widgets-list">
              {widgets.map((widget, index) => (
                <div key={widget.id} className="widget-item">
                  <div className="widget-info">
                    <span className="widget-icon">{widgetTypes[widget.type]?.icon}</span>
                    <div className="widget-details">
                      <h4>{widgetTypes[widget.type]?.name}</h4>
                      <p>{widgetTypes[widget.type]?.description}</p>
                    </div>
                  </div>
                  
                  <div className="widget-actions">
                    <button
                      className={`toggle-button ${widget.visible ? 'active' : ''}`}
                      onClick={() => handleWidgetToggle(widget.id)}
                      title={widget.visible ? 'Ocultar widget' : 'Mostrar widget'}
                    >
                      {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    
                    <div className="order-controls">
                      <button
                        className="order-button"
                        onClick={() => handleWidgetOrder(widget.id, 'up')}
                        disabled={index === 0}
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                      <button
                        className="order-button"
                        onClick={() => handleWidgetOrder(widget.id, 'down')}
                        disabled={index === widgets.length - 1}
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsModal; 