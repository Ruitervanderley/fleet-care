import React from 'react';
import { X } from 'lucide-react';

export default function WidgetFrame({ title, onClose, children }) {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <h3>{title}</h3>
        {onClose && (
          <button className="widget-action-btn" aria-label="Fechar widget" onClick={onClose} title="Fechar widget">
            <X size={16} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
} 