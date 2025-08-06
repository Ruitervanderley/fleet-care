import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  headerActions
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Adicionar event listener para ESC
      const handleEscKey = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'modal-small';
      case 'large':
        return 'modal-large';
      case 'extra-large':
        return 'modal-extra-large';
      case 'full':
        return 'modal-full';
      default:
        return 'modal-medium';
    }
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay-new" onClick={handleOverlayClick}>
      <div className={`modal-content-new ${getSizeClass()} ${className}`}>
        {(title || showCloseButton || headerActions) && (
          <div className="modal-header-new">
            <div className="modal-title-new">{title}</div>
            <div className="modal-header-actions">
              {headerActions}
              {showCloseButton && (
                <button
                  className="modal-close-new"
                  onClick={onClose}
                  aria-label="Fechar modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="modal-body-new">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;