import React from 'react';

const SkeletonLoader = ({ type = 'card', lines = 3, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`skeleton-card ${className}`}>
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-title"></div>
            </div>
            <div className="skeleton-content">
              {Array.from({ length: lines }).map((_, index) => (
                <div key={index} className="skeleton-line"></div>
              ))}
            </div>
            <div className="skeleton-footer">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`skeleton-table ${className}`}>
            <div className="skeleton-table-header">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="skeleton-th"></div>
              ))}
            </div>
            <div className="skeleton-table-body">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="skeleton-tr">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <div key={colIndex} className="skeleton-td"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`skeleton-list ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="skeleton-list-item">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className={`skeleton-chart ${className}`}>
            <div className="skeleton-chart-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-chart-content">
              <div className="skeleton-bars">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`skeleton-default ${className}`}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader; 