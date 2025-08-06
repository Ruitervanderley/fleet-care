import React, { useState, useEffect } from 'react'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  Wrench,
  DollarSign,
  BarChart2,
  Download
} from 'lucide-react'

const PredictiveAnalysis = ({ data }) => {
  const [predictions, setPredictions] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)

  // Simulação de modelo ML para previsões
  const generatePredictions = () => {
    setIsLoading(true)
    
    // Simular processamento ML
    setTimeout(() => {
      const predictedData = {
        failureProbability: (data?.equipmentList || []).map(equipment => ({
          tag: equipment.tag,
          probability: Math.random() * 100,
          nextFailure: Math.floor(Math.random() * 90) + 1,
          criticalComponents: [
            {
              name: 'Motor',
              health: Math.random() * 100,
              recommendation: 'Inspeção preventiva recomendada'
            },
            {
              name: 'Sistema Hidráulico',
              health: Math.random() * 100,
              recommendation: 'Substituição em 45 dias'
            }
          ]
        })),
        maintenanceOptimization: {
          currentCost: Math.random() * 100000 + 50000,
          optimizedCost: Math.random() * 80000 + 40000,
          savingsPercentage: Math.random() * 30 + 10,
          recommendations: [
            'Ajustar frequência de manutenção preventiva',
            'Priorizar inspeções em componentes críticos',
            'Implementar monitoramento em tempo real'
          ]
        },
        performanceAnalysis: {
          currentEfficiency: Math.random() * 20 + 75,
          potentialEfficiency: Math.random() * 15 + 82,
          bottlenecks: [
            'Tempo de parada não planejada',
            'Ciclos de manutenção longos',
            'Baixa disponibilidade de peças'
          ]
        }
      }

      setPredictions(predictedData)
      setIsLoading(false)
    }, 1500)
  }

  useEffect(() => {
    if (data?.equipmentList?.length > 0) {
      generatePredictions()
    }
  }, [timeRange, data])

  if (isLoading) {
    return (
      <div className="predictive-analysis loading">
        <div className="loading-spinner">
          <Brain size={48} className="animate-pulse" />
          <p>Processando análise preditiva...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="predictive-analysis">
      <div className="analysis-header">
        <div className="header-title">
          <Brain size={24} />
          <div>
            <h2>Análise Preditiva</h2>
            <p>Previsões baseadas em Machine Learning</p>
          </div>
        </div>
        <div className="header-actions">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
          </select>
          <button className="refresh-btn" onClick={generatePredictions}>
            Atualizar Análise
          </button>
        </div>
      </div>

      <div className="predictions-grid">
        {/* Probabilidade de Falhas */}
        <div className="prediction-card failure-probability">
          <div className="card-header">
            <AlertTriangle size={20} />
            <h3>Probabilidade de Falhas</h3>
          </div>
          <div className="card-content">
            {predictions.failureProbability.slice(0, 5).map((item, index) => (
              <div key={index} className="equipment-risk">
                <div className="risk-header">
                  <strong>{item.tag}</strong>
                  <span className={`risk-badge ${item.probability > 70 ? 'high' : item.probability > 30 ? 'medium' : 'low'}`}>
                    {item.probability.toFixed(1)}% risco
                  </span>
                </div>
                <div className="risk-details">
                  <span>Próxima falha estimada: {item.nextFailure} dias</span>
                  <div className="components-list">
                    {item.criticalComponents.map((component, idx) => (
                      <div key={idx} className="component-item">
                        <span>{component.name}</span>
                        <div className="health-bar">
                          <div 
                            className="health-fill" 
                            style={{ 
                              width: `${component.health}%`,
                              background: component.health > 70 ? '#10b981' : component.health > 30 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Otimização de Manutenção */}
        <div className="prediction-card maintenance-optimization">
          <div className="card-header">
            <Wrench size={20} />
            <h3>Otimização de Manutenção</h3>
          </div>
          <div className="card-content">
            <div className="cost-comparison">
              <div className="cost-item">
                <span>Custo Atual</span>
                <strong>R$ {predictions.maintenanceOptimization.currentCost.toLocaleString()}</strong>
              </div>
              <div className="cost-item optimized">
                <span>Custo Otimizado</span>
                <strong>R$ {predictions.maintenanceOptimization.optimizedCost.toLocaleString()}</strong>
              </div>
              <div className="savings">
                <DollarSign size={20} />
                <span>Economia Potencial: {predictions.maintenanceOptimization.savingsPercentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="recommendations">
              <h4>Recomendações</h4>
              <ul>
                {predictions.maintenanceOptimization.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Análise de Performance */}
        <div className="prediction-card performance-analysis">
          <div className="card-header">
            <BarChart2 size={20} />
            <h3>Análise de Performance</h3>
          </div>
          <div className="card-content">
            <div className="efficiency-metrics">
              <div className="efficiency-item">
                <span>Eficiência Atual</span>
                <div className="efficiency-value">
                  <strong>{predictions.performanceAnalysis.currentEfficiency.toFixed(1)}%</strong>
                  <div className="efficiency-bar">
                    <div 
                      className="efficiency-fill"
                      style={{ width: `${predictions.performanceAnalysis.currentEfficiency}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="efficiency-item potential">
                <span>Eficiência Potencial</span>
                <div className="efficiency-value">
                  <strong>{predictions.performanceAnalysis.potentialEfficiency.toFixed(1)}%</strong>
                  <div className="efficiency-bar">
                    <div 
                      className="efficiency-fill"
                      style={{ width: `${predictions.performanceAnalysis.potentialEfficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bottlenecks">
              <h4>Gargalos Identificados</h4>
              <ul>
                {predictions.performanceAnalysis.bottlenecks.map((bottleneck, index) => (
                  <li key={index}>{bottleneck}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalysis 