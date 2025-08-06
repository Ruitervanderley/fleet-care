import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart2,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

const TrendAnalysis = ({ data }) => {
  const [timeRange, setTimeRange] = useState('30d')
  const [chartType, setChartType] = useState('line')
  const [isLoading, setIsLoading] = useState(false)

  // Dados simulados para demonstração
  const getTrendData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    return {
      maintenance: {
        preventive: months.map(() => Math.floor(Math.random() * 20) + 10),
        corrective: months.map(() => Math.floor(Math.random() * 15) + 5),
        predictive: months.map(() => Math.floor(Math.random() * 8) + 2)
      },
      costs: {
        preventive: months.map(() => Math.floor(Math.random() * 50000) + 20000),
        corrective: months.map(() => Math.floor(Math.random() * 80000) + 40000),
        predictive: months.map(() => Math.floor(Math.random() * 30000) + 15000)
      },
      availability: months.map(() => (Math.random() * 10 + 85).toFixed(1)),
      mtbf: months.map(() => Math.floor(Math.random() * 500) + 1000),
      mttr: months.map(() => Math.floor(Math.random() * 24) + 12)
    }
  }

  const getPredictions = () => {
    return {
      nextMonth: {
        maintenanceCount: Math.floor(Math.random() * 10) + 20,
        estimatedCost: Math.floor(Math.random() * 100000) + 150000,
        confidence: (Math.random() * 10 + 85).toFixed(1)
      },
      nextQuarter: {
        maintenanceCount: Math.floor(Math.random() * 20) + 50,
        estimatedCost: Math.floor(Math.random() * 200000) + 300000,
        confidence: (Math.random() * 10 + 80).toFixed(1)
      },
      nextYear: {
        maintenanceCount: Math.floor(Math.random() * 50) + 150,
        estimatedCost: Math.floor(Math.random() * 500000) + 1000000,
        confidence: (Math.random() * 10 + 75).toFixed(1)
      }
    }
  }

  const handleExport = () => {
    setIsLoading(true)
    setTimeout(() => {
      const exportData = {
        trends: getTrendData(),
        predictions: getPredictions(),
        timestamp: new Date().toISOString(),
        timeRange
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trend-analysis-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      setIsLoading(false)
    }, 1000)
  }

  const trendData = getTrendData()
  const predictions = getPredictions()

  return (
    <div className="trend-analysis">
      {/* Cabeçalho */}
      <div className="trend-header">
        <div className="trend-title">
          <h2>Análise de Tendências</h2>
          <p>Visualização e previsão de indicadores</p>
        </div>
        <div className="trend-actions">
          <div className="time-filter">
            <Filter size={16} />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
              <option value="90d">90 dias</option>
              <option value="365d">1 ano</option>
            </select>
          </div>
          <div className="chart-type">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="chart-select"
            >
              <option value="line">Linha</option>
              <option value="bar">Barra</option>
              <option value="pie">Pizza</option>
            </select>
          </div>
          <button 
            className="export-btn"
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isLoading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon maintenance">
            <BarChart2 size={24} />
          </div>
          <div className="kpi-content">
            <h4>Total Manutenções</h4>
            <div className="kpi-value">
              {trendData.maintenance.preventive.reduce((a, b) => a + b, 0) +
               trendData.maintenance.corrective.reduce((a, b) => a + b, 0) +
               trendData.maintenance.predictive.reduce((a, b) => a + b, 0)}
            </div>
            <div className="kpi-trend up">
              <TrendingUp size={16} />
              +12.5%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon costs">
            <LineChart size={24} />
          </div>
          <div className="kpi-content">
            <h4>Custo Total</h4>
            <div className="kpi-value">
              R$ {(trendData.costs.preventive.reduce((a, b) => a + b, 0) +
                   trendData.costs.corrective.reduce((a, b) => a + b, 0) +
                   trendData.costs.predictive.reduce((a, b) => a + b, 0)).toLocaleString()}
            </div>
            <div className="kpi-trend down">
              <TrendingDown size={16} />
              -5.2%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon availability">
            <PieChart size={24} />
          </div>
          <div className="kpi-content">
            <h4>Disponibilidade Média</h4>
            <div className="kpi-value">
              {(trendData.availability.reduce((a, b) => Number(a) + Number(b), 0) / 
                trendData.availability.length).toFixed(1)}%
            </div>
            <div className="kpi-trend up">
              <TrendingUp size={16} />
              +2.1%
            </div>
          </div>
        </div>
      </div>

      {/* Previsões */}
      <div className="predictions-section">
        <h3>Previsões IA</h3>
        <div className="predictions-grid">
          <div className="prediction-card">
            <div className="prediction-header">
              <h4>Próximo Mês</h4>
              <span className="confidence-badge">
                {predictions.nextMonth.confidence}% confiança
              </span>
            </div>
            <div className="prediction-content">
              <div className="prediction-item">
                <span>Manutenções Previstas:</span>
                <strong>{predictions.nextMonth.maintenanceCount}</strong>
              </div>
              <div className="prediction-item">
                <span>Custo Estimado:</span>
                <strong>R$ {predictions.nextMonth.estimatedCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="prediction-card">
            <div className="prediction-header">
              <h4>Próximo Trimestre</h4>
              <span className="confidence-badge">
                {predictions.nextQuarter.confidence}% confiança
              </span>
            </div>
            <div className="prediction-content">
              <div className="prediction-item">
                <span>Manutenções Previstas:</span>
                <strong>{predictions.nextQuarter.maintenanceCount}</strong>
              </div>
              <div className="prediction-item">
                <span>Custo Estimado:</span>
                <strong>R$ {predictions.nextQuarter.estimatedCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="prediction-card">
            <div className="prediction-header">
              <h4>Próximo Ano</h4>
              <span className="confidence-badge">
                {predictions.nextYear.confidence}% confiança
              </span>
            </div>
            <div className="prediction-content">
              <div className="prediction-item">
                <span>Manutenções Previstas:</span>
                <strong>{predictions.nextYear.maintenanceCount}</strong>
              </div>
              <div className="prediction-item">
                <span>Custo Estimado:</span>
                <strong>R$ {predictions.nextYear.estimatedCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .trend-analysis {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          box-shadow: var(--shadow);
        }

        .trend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-6);
        }

        .trend-title h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--gray-800);
        }

        .trend-title p {
          margin: 0;
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .trend-actions {
          display: flex;
          gap: var(--spacing-4);
          align-items: center;
        }

        .time-filter,
        .chart-type {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          background: var(--gray-50);
          padding: var(--spacing-2);
          border-radius: var(--radius);
        }

        .time-select,
        .chart-select {
          border: none;
          background: transparent;
          color: var(--gray-700);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .export-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-4);
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: var(--primary-dark);
        }

        .export-btn:disabled {
          background: var(--gray-400);
          cursor: not-allowed;
        }

        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-8);
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
          padding: var(--spacing-4);
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          transition: transform 0.2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
        }

        .kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius);
        }

        .kpi-icon.maintenance {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
        }

        .kpi-icon.costs {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .kpi-icon.availability {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-content h4 {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0.25rem 0;
        }

        .kpi-trend {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-1);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .kpi-trend.up {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .kpi-trend.down {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .predictions-section {
          margin-top: var(--spacing-8);
        }

        .predictions-section h3 {
          margin-bottom: var(--spacing-4);
          font-size: 1.25rem;
          color: var(--gray-800);
        }

        .predictions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-4);
        }

        .prediction-card {
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          padding: var(--spacing-4);
        }

        .prediction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-4);
        }

        .prediction-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--gray-700);
        }

        .confidence-badge {
          padding: 0.25rem 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .prediction-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .prediction-item span {
          color: var(--gray-600);
        }

        .prediction-item strong {
          color: var(--gray-800);
        }

        @media (max-width: 768px) {
          .trend-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-4);
          }

          .trend-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .time-filter,
          .chart-type {
            flex: 1;
          }

          .export-btn {
            width: 100%;
            justify-content: center;
          }

          .kpis-grid,
          .predictions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default TrendAnalysis 