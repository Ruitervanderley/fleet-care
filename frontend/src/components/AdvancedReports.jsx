import React, { useState } from 'react'
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Printer,
  Mail,
  Share2,
  ChevronDown,
  ChevronUp,
  BarChart2,
  PieChart,
  LineChart,
  Wrench,
  DollarSign,
  Activity
} from 'lucide-react'

const AdvancedReports = ({ data }) => {
  const [selectedReport, setSelectedReport] = useState('maintenance')
  const [dateRange, setDateRange] = useState('30d')
  const [expandedSections, setExpandedSections] = useState({
    maintenance: true,
    costs: true,
    performance: true
  })
  const [exportFormat, setExportFormat] = useState('pdf')
  const [isGenerating, setIsGenerating] = useState(false)

  const reports = {
    maintenance: {
      title: 'Relatório de Manutenções',
      icon: <Wrench size={20} />,
      metrics: [
        {
          label: 'Total de Manutenções',
          value: '157',
          trend: '+12%',
          trendType: 'positive'
        },
        {
          label: 'Tempo Médio de Reparo',
          value: '4.2h',
          trend: '-8%',
          trendType: 'positive'
        },
        {
          label: 'Taxa de Conclusão',
          value: '94%',
          trend: '+5%',
          trendType: 'positive'
        }
      ],
      details: [
        { label: 'Preventivas', value: 98, percentage: 62 },
        { label: 'Corretivas', value: 45, percentage: 29 },
        { label: 'Preditivas', value: 14, percentage: 9 }
      ]
    },
    costs: {
      title: 'Relatório Financeiro',
      icon: <DollarSign size={20} />,
      metrics: [
        {
          label: 'Custo Total',
          value: 'R$ 245.780',
          trend: '-5%',
          trendType: 'positive'
        },
        {
          label: 'Custo Médio/Equip.',
          value: 'R$ 4.230',
          trend: '-3%',
          trendType: 'positive'
        },
        {
          label: 'ROI Manutenção',
          value: '168%',
          trend: '+15%',
          trendType: 'positive'
        }
      ],
      details: [
        { label: 'Peças', value: 125400, percentage: 51 },
        { label: 'Mão de Obra', value: 89300, percentage: 36 },
        { label: 'Serviços', value: 31080, percentage: 13 }
      ]
    },
    performance: {
      title: 'Relatório de Performance',
      icon: <Activity size={20} />,
      metrics: [
        {
          label: 'Disponibilidade',
          value: '92%',
          trend: '+3%',
          trendType: 'positive'
        },
        {
          label: 'MTBF',
          value: '720h',
          trend: '+8%',
          trendType: 'positive'
        },
        {
          label: 'OEE',
          value: '85%',
          trend: '+4%',
          trendType: 'positive'
        }
      ],
      details: [
        { label: 'Alta Performance', value: 42, percentage: 68 },
        { label: 'Performance Normal', value: 15, percentage: 24 },
        { label: 'Baixa Performance', value: 5, percentage: 8 }
      ]
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleExport = async () => {
    setIsGenerating(true)
    // Simular geração de relatório
    setTimeout(() => {
      setIsGenerating(false)
      // Aqui você implementaria a lógica real de exportação
      alert('Relatório exportado com sucesso!')
    }, 2000)
  }

  const handleShare = () => {
    // Implementar lógica de compartilhamento
    alert('Função de compartilhamento será implementada em breve!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = () => {
    // Implementar lógica de envio por email
    alert('Função de envio por email será implementada em breve!')
  }

  return (
    <div className="advanced-reports">
      {/* Cabeçalho */}
      <div className="reports-header">
        <div className="header-title">
          <FileText size={24} />
          <div>
            <h2>Relatórios Avançados</h2>
            <p>Análises detalhadas e exportação de dados</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="report-filters">
            <div className="filter-item">
              <Filter size={16} />
              <select 
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="report-select"
              >
                <option value="maintenance">Manutenções</option>
                <option value="costs">Financeiro</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div className="filter-item">
              <Calendar size={16} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="date-select"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="365d">Último ano</option>
              </select>
            </div>
          </div>
          <div className="export-actions">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="format-select"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <button 
              className="action-btn export"
              onClick={handleExport}
              disabled={isGenerating}
            >
              <Download size={16} />
              {isGenerating ? 'Gerando...' : 'Exportar'}
            </button>
            <button className="action-btn print" onClick={handlePrint}>
              <Printer size={16} />
            </button>
            <button className="action-btn email" onClick={handleEmail}>
              <Mail size={16} />
            </button>
            <button className="action-btn share" onClick={handleShare}>
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div className="report-content">
        {Object.entries(reports).map(([key, report]) => (
          <div key={key} className={`report-section ${key === selectedReport ? 'active' : ''}`}>
            <div 
              className="section-header"
              onClick={() => toggleSection(key)}
            >
              <div className="section-title">
                {report.icon}
                <h3>{report.title}</h3>
              </div>
              {expandedSections[key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expandedSections[key] && (
              <div className="section-content">
                {/* Métricas Principais */}
                <div className="metrics-grid">
                  {report.metrics.map((metric, index) => (
                    <div key={index} className="metric-card">
                      <span className="metric-label">{metric.label}</span>
                      <div className="metric-value">{metric.value}</div>
                      <div className={`metric-trend ${metric.trendType}`}>
                        {metric.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalhes */}
                <div className="details-section">
                  <h4>Detalhamento</h4>
                  <div className="details-grid">
                    {report.details.map((detail, index) => (
                      <div key={index} className="detail-item">
                        <div className="detail-header">
                          <span>{detail.label}</span>
                          <strong>{detail.value}</strong>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${detail.percentage}%` }}
                          />
                        </div>
                        <span className="percentage">{detail.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visualizações */}
                <div className="visualizations">
                  <div className="viz-header">
                    <h4>Visualizações</h4>
                    <div className="viz-types">
                      <button className="viz-type-btn active">
                        <BarChart2 size={16} />
                      </button>
                      <button className="viz-type-btn">
                        <LineChart size={16} />
                      </button>
                      <button className="viz-type-btn">
                        <PieChart size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="viz-placeholder">
                    Área reservada para gráficos interativos
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .advanced-reports {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          box-shadow: var(--shadow);
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-6);
          gap: var(--spacing-4);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .header-title h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--gray-800);
        }

        .header-title p {
          margin: 0;
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        .header-actions {
          display: flex;
          gap: var(--spacing-4);
        }

        .report-filters {
          display: flex;
          gap: var(--spacing-2);
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2);
          background: var(--gray-50);
          border-radius: var(--radius);
        }

        .report-select,
        .date-select,
        .format-select {
          border: none;
          background: transparent;
          color: var(--gray-700);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .export-actions {
          display: flex;
          gap: var(--spacing-2);
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-2) var(--spacing-4);
          border: none;
          border-radius: var(--radius);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.export {
          background: var(--primary);
          color: white;
        }

        .action-btn.export:hover {
          background: var(--primary-dark);
        }

        .action-btn.print,
        .action-btn.email,
        .action-btn.share {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .action-btn.print:hover,
        .action-btn.email:hover,
        .action-btn.share:hover {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .action-btn:disabled {
          background: var(--gray-300);
          cursor: not-allowed;
        }

        .report-section {
          margin-bottom: var(--spacing-4);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .report-section.active {
          border-color: var(--primary);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-4);
          background: var(--gray-50);
          cursor: pointer;
          transition: background 0.2s;
        }

        .section-header:hover {
          background: var(--gray-100);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
        }

        .section-title h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--gray-800);
        }

        .section-content {
          padding: var(--spacing-4);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-6);
        }

        .metric-card {
          padding: var(--spacing-4);
          background: var(--gray-50);
          border-radius: var(--radius);
          text-align: center;
        }

        .metric-label {
          display: block;
          color: var(--gray-600);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-2);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-2);
        }

        .metric-trend {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .metric-trend.positive {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .metric-trend.negative {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .details-section {
          margin-bottom: var(--spacing-6);
        }

        .details-section h4 {
          margin: 0 0 var(--spacing-4) 0;
          font-size: 1rem;
          color: var(--gray-700);
        }

        .details-grid {
          display: grid;
          gap: var(--spacing-4);
        }

        .detail-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--spacing-2);
          align-items: center;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-2);
        }

        .detail-header span {
          color: var(--gray-600);
          font-size: 0.875rem;
        }

        .detail-header strong {
          color: var(--gray-800);
        }

        .progress-bar {
          grid-column: 1 / -1;
          height: 8px;
          background: var(--gray-200);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s ease;
        }

        .percentage {
          color: var(--gray-600);
          font-size: 0.875rem;
          text-align: right;
        }

        .visualizations {
          border-top: 1px solid var(--gray-200);
          padding-top: var(--spacing-4);
        }

        .viz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-4);
        }

        .viz-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--gray-700);
        }

        .viz-types {
          display: flex;
          gap: var(--spacing-2);
        }

        .viz-type-btn {
          padding: var(--spacing-2);
          background: var(--gray-100);
          border: none;
          border-radius: var(--radius);
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .viz-type-btn:hover {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .viz-type-btn.active {
          background: var(--primary);
          color: white;
        }

        .viz-placeholder {
          height: 300px;
          background: var(--gray-50);
          border: 2px dashed var(--gray-200);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .reports-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .report-filters {
            width: 100%;
          }

          .filter-item {
            flex: 1;
          }

          .export-actions {
            width: 100%;
            justify-content: space-between;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .header-actions,
          .section-header {
            display: none;
          }

          .report-section {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

export default AdvancedReports 