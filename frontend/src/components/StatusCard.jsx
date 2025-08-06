import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Settings,
  Activity,
  Wrench
} from 'lucide-react'

const StatusCard = ({ title, value, icon, color, description, trend, trendType }) => {
  const getIcon = () => {
    const iconMap = {
      'check': <CheckCircle size={28} />,
      'alert': <AlertTriangle size={28} />,
      'alert-circle': <AlertCircle size={28} />,
      'settings': <Settings size={28} />,
      'activity': <Activity size={28} />,
      'wrench': <Wrench size={28} />
    }
    
    return iconMap[icon] || <Activity size={28} />
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

  return (
    <div className={`status-card status-card--${color}`}>
      <div className="status-card-header">
        <div className="status-icon">
          {getIcon()}
        </div>
        <div className="status-info">
          <h3 className="status-title">{title}</h3>
          <div className="status-value">{value}</div>
        </div>
      </div>
      
      <div className="status-card-content">
        <p className="status-description">{description}</p>
        
        {trend && (
          <div className={`status-trend status-trend--${trendType}`}>
            {getTrendIcon()}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusCard 