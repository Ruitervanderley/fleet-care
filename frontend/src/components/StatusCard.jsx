import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const StatusCard = ({ title, value, icon, type, description, trend, trendType }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'ok':
        return {
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          color: '#059669',
          borderColor: '#10b981'
        }
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          color: '#d97706',
          borderColor: '#f59e0b'
        }
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          color: '#dc2626',
          borderColor: '#ef4444'
        }
      case 'info':
        return {
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          color: '#1e40af',
          borderColor: '#3b82f6'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          color: '#374151',
          borderColor: '#6b7280'
        }
    }
  }

  const getTrendIcon = () => {
    switch (trendType) {
      case 'positive':
        return <TrendingUp size={14} />
      case 'negative':
        return <TrendingDown size={14} />
      case 'neutral':
        return <Minus size={14} />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return '#059669'
      case 'negative':
        return '#dc2626'
      case 'neutral':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="status-card-modern" style={{ borderColor: styles.borderColor }}>
      <div className="status-card-header">
        <div className="status-icon" style={{ background: styles.background, color: styles.color }}>
          {icon}
        </div>
        <div className="status-info">
          <h3 className="status-title">{title}</h3>
          <div className="status-value">{value}</div>
        </div>
      </div>
      
      <div className="status-card-content">
        <p className="status-description">{description}</p>
        
        {trend && (
          <div className="status-trend" style={{ color: getTrendColor() }}>
            {getTrendIcon()}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="status-card-footer">
        <div className="status-indicator" style={{ background: styles.background }}></div>
      </div>
    </div>
  )
}

export default StatusCard 