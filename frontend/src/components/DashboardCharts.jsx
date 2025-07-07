import React, { useState, useRef, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

const DashboardCharts = ({ dashboardData, equipmentList }) => {
  const [selectedChart, setSelectedChart] = useState(null)
  const [drillDownData, setDrillDownData] = useState(null)
  const [chartView, setChartView] = useState('overview')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const chartRef = useRef(null)

  // Dados para gráficos interativos
  const getEquipmentStatusData = () => {
    const statusCount = equipmentList.reduce((acc, equipment) => {
      acc[equipment.status] = (acc[equipment.status] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'Ativo' ? '#10b981' : status === 'Manutenção' ? '#f59e0b' : '#ef4444'
    }))
  }

  const getEquipmentTypeData = () => {
    const typeCount = equipmentList.reduce((acc, equipment) => {
      acc[equipment.tipo] = (acc[equipment.tipo] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(typeCount).map(([type, count], index) => ({
      name: type,
      value: count,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
    }))
  }

  const getMaintenanceTrendData = () => {
    // Simular dados de tendência de manutenção
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    return months.map((month, index) => ({
      month,
      preventiva: Math.floor(Math.random() * 20) + 10,
      corretiva: Math.floor(Math.random() * 15) + 5,
      preditiva: Math.floor(Math.random() * 8) + 2
    }))
  }

  const getMaintenancePredictions = () => {
    // Simular previsões IA para próximas manutenções
    return equipmentList.slice(0, 8).map((equipment, index) => {
      const daysUntilMaintenance = Math.floor(Math.random() * 30) + 1
      const confidence = Math.floor(Math.random() * 30) + 70
      const maintenanceType = ['Preventiva', 'Preditiva', 'Corretiva'][Math.floor(Math.random() * 3)]
      
      return {
        id: equipment.id || index,
        tag: equipment.tag,
        tipo: equipment.tipo,
        daysUntilMaintenance,
        confidence,
        maintenanceType,
        priority: daysUntilMaintenance <= 7 ? 'Alta' : daysUntilMaintenance <= 15 ? 'Média' : 'Baixa',
        estimatedCost: Math.floor(Math.random() * 5000) + 1000,
        riskLevel: confidence < 80 ? 'Alto' : confidence < 90 ? 'Médio' : 'Baixo'
      }
    }).sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance)
  }

  const getTrendAnalysis = () => {
    // Análise de tendências baseada em dados históricos simulados
    const trends = {
      totalMaintenance: {
        current: 45,
        previous: 38,
        trend: 'up',
        percentage: 18.4
      },
      preventiveMaintenance: {
        current: 28,
        previous: 25,
        trend: 'up',
        percentage: 12.0
      },
      correctiveMaintenance: {
        current: 12,
        previous: 10,
        trend: 'up',
        percentage: 20.0
      },
      predictiveMaintenance: {
        current: 5,
        previous: 3,
        trend: 'up',
        percentage: 66.7
      },
      equipmentUptime: {
        current: 94.2,
        previous: 92.8,
        trend: 'up',
        percentage: 1.5
      },
      maintenanceCost: {
        current: 125000,
        previous: 118000,
        trend: 'up',
        percentage: 5.9
      }
    }
    
    return trends
  }

  const getEquipmentPerformanceData = () => {
    return equipmentList.slice(0, 10).map((equipment, index) => ({
      name: equipment.tag,
      eficiencia: Math.floor(Math.random() * 30) + 70,
      disponibilidade: Math.floor(Math.random() * 20) + 80,
      performance: Math.floor(Math.random() * 15) + 85
    }))
  }

  // Handlers para interatividade
  const handleChartClick = (data, chartType) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload
      
      if (chartType === 'status') {
        setDrillDownData({
          type: 'status',
          title: `Equipamentos ${clickedData.name}`,
          data: equipmentList.filter(eq => eq.status === clickedData.name)
        })
      } else if (chartType === 'type') {
        setDrillDownData({
          type: 'type',
          title: `Equipamentos ${clickedData.name}`,
          data: equipmentList.filter(eq => eq.tipo === clickedData.name)
        })
      }
      
      setChartView('drilldown')
    }
  }

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload
      setSelectedEquipment(clickedData)
      setChartView('equipment-detail')
    }
  }

  const handleBackToOverview = () => {
    setChartView('overview')
    setDrillDownData(null)
    setSelectedEquipment(null)
  }

  const renderDrillDownView = () => {
    if (!drillDownData) return null

    return (
      <div className="drill-down-view">
        <div className="drill-down-header">
          <button onClick={handleBackToOverview} className="back-btn">
            <ChevronLeft size={20} />
            Voltar
          </button>
          <h3>{drillDownData.title}</h3>
          <span className="drill-down-count">{drillDownData.data.length} equipamentos</span>
        </div>
        
        <div className="drill-down-content">
          <div className="equipment-list">
            {drillDownData.data.map((equipment, index) => (
              <div key={equipment.id || index} className="equipment-item">
                <div className="equipment-info">
                  <h4>{equipment.tag}</h4>
                  <p>{equipment.tipo}</p>
                </div>
                <div className={`status-badge ${equipment.status?.toLowerCase() || 'ativo'}`}>
                  {equipment.status || 'Ativo'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderEquipmentDetailView = () => {
    if (!selectedEquipment) return null

    return (
      <div className="equipment-detail-view">
        <div className="detail-header">
          <button onClick={handleBackToOverview} className="back-btn">
            <ChevronLeft size={20} />
            Voltar
          </button>
          <h3>{selectedEquipment.name}</h3>
        </div>
        
        <div className="detail-content">
          <div className="detail-metrics">
            <div className="metric-card">
              <h4>Eficiência</h4>
              <div className="metric-value">{selectedEquipment.eficiencia}%</div>
            </div>
            <div className="metric-card">
              <h4>Disponibilidade</h4>
              <div className="metric-value">{selectedEquipment.disponibilidade}%</div>
            </div>
            <div className="metric-card">
              <h4>Performance</h4>
              <div className="metric-value">{selectedEquipment.performance}%</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (chartView === 'drilldown') {
    return renderDrillDownView()
  }

  if (chartView === 'equipment-detail') {
    return renderEquipmentDetailView()
  }

  return (
    <div className="dashboard-charts" ref={chartRef}>
      <div className="charts-header">
        <h2>Análise e Gráficos</h2>
        <p>Visualizações interativas dos dados da frota</p>
      </div>

      <div className="charts-grid">
        {/* Status dos Equipamentos - Cards Simples */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Status dos Equipamentos</h3>
            <p>Distribuição por status</p>
          </div>
          <div className="status-summary">
            {getEquipmentStatusData().map((status, index) => (
              <div key={index} className="status-item" style={{ borderLeftColor: status.color }}>
                <div className="status-name">{status.name}</div>
                <div className="status-count">{status.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Equipamento - Cards Simples */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Tipos de Equipamento</h3>
            <p>Distribuição por tipo</p>
          </div>
          <div className="type-summary">
            {getEquipmentTypeData().map((type, index) => (
              <div key={index} className="type-item" style={{ borderLeftColor: type.color }}>
                <div className="type-name">{type.name}</div>
                <div className="type-count">{type.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise de Tendências */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Análise de Tendências</h3>
            <p>Comparação com período anterior</p>
          </div>
          <div className="trends-analysis">
            {Object.entries(getTrendAnalysis()).map(([key, trend]) => (
              <div key={key} className="trend-item">
                <div className="trend-info">
                  <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                  <div className="trend-values">
                    <span className="trend-current">
                      {key.includes('Cost') ? `R$ ${trend.current.toLocaleString()}` : trend.current}
                    </span>
                    <span className={`trend-percentage ${trend.trend}`}>
                      {trend.trend === 'up' ? '+' : '-'}{trend.percentage}%
                    </span>
                  </div>
                </div>
                <div className={`trend-icon ${trend.trend}`}>
                  {trend.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previsões IA */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Previsões IA - Próximas Manutenções</h3>
            <p>Análise preditiva baseada em IA</p>
          </div>
          <div className="predictions-list">
            {getMaintenancePredictions().map((prediction, index) => (
              <div key={prediction.id} className="prediction-item">
                <div className="prediction-header">
                  <div className="prediction-equipment">
                    <h4>{prediction.tag}</h4>
                    <span className="prediction-type">{prediction.tipo}</span>
                  </div>
                  <div className="prediction-priority">
                    <span className={`priority-badge priority-${prediction.priority.toLowerCase()}`}>
                      {prediction.priority}
                    </span>
                  </div>
                </div>
                <div className="prediction-details">
                  <div className="prediction-metric">
                    <span className="metric-label">Dias até manutenção:</span>
                    <span className="metric-value">{prediction.daysUntilMaintenance}</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="metric-label">Confiança IA:</span>
                    <span className="metric-value">{prediction.confidence}%</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="metric-label">Tipo:</span>
                    <span className="metric-value">{prediction.maintenanceType}</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="metric-label">Custo estimado:</span>
                    <span className="metric-value">R$ {prediction.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="prediction-metric">
                    <span className="metric-label">Nível de risco:</span>
                    <span className={`risk-level risk-${prediction.riskLevel.toLowerCase()}`}>
                      {prediction.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts 