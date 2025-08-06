import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, X, Settings } from 'lucide-react';

const DraggableWidget = ({ 
  id, 
  title, 
  children, 
  onMove, 
  onRemove, 
  onSettings,
  isDragging = false,
  className = '' 
}) => {
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.widget-handle')) {
      setIsDraggingLocal(true);
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingLocal) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingLocal) {
      setIsDraggingLocal(false);
      if (onMove) {
        onMove(id, position);
      }
    }
  };

  useEffect(() => {
    if (isDraggingLocal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingLocal, dragOffset]);

  return (
    <div
      ref={widgetRef}
      className={`draggable-widget ${isDraggingLocal ? 'dragging' : ''} ${className}`}
      style={{
        transform: isDraggingLocal ? `translate(${position.x}px, ${position.y}px)` : 'none',
        zIndex: isDraggingLocal ? 1000 : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="widget-header">
        <div className="widget-handle">
          <GripVertical size={16} />
        </div>
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {onSettings && (
            <button 
              className="widget-action-btn"
              onClick={() => onSettings(id)}
              title="Configurações"
            >
              <Settings size={16} />
            </button>
          )}
          {onRemove && (
            <button 
              className="widget-action-btn"
              onClick={() => onRemove(id)}
              title="Remover"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default DraggableWidget; 