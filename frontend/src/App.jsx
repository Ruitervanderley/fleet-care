import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Download,
  Settings,
  FileSpreadsheet,
  Sun,
  Moon,
  Wrench,
  Building,
  Database,
  Search,
  X,
  RotateCcw,
  TrendingUp,
  Activity,
  TrendingDown,
  Eye,
  BarChart,
  BarChart3,
  Cog,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  PieChart,
  LineChart,
  Target,
  Users
} from 'lucide-react'
import StatusCard from './components/StatusCard'
import EquipmentTable from './components/EquipmentTable'
import MaintenanceAlert from './components/MaintenanceAlert'
import IntervalConfig from './components/IntervalConfig'
import CriticalAlerts from './components/CriticalAlerts'
import EquipmentFilters from './components/EquipmentFilters'
import DashboardCharts from './components/DashboardCharts'
import MaintenanceList from './components/MaintenanceList'
import MaintenanceDetail from './components/MaintenanceDetail'
import SupplierManagement from './components/SupplierManagement'
import SystemConfig from './components/SystemConfig'
import logoArruda from './assets/logo-arruda.png'

const API_BASE = 'http://localhost:8000'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  console.log('DEBUG activeTab:', activeTab);
  const [equipmentList, setEquipmentList] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showIntervalModal, setShowIntervalModal] = useState(false)
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState([])
  const [supplierData, setSupplierData] = useState([])
  const [theme, setTheme] = useState('light')
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [showConfig, setShowConfig] = useState(false)
  const [showCharts, setShowCharts] = useState(true)
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  })
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [dashboardLayout, setDashboardLayout] = useState('grid')
  const [widgets, setWidgets] = useState([
    { id: 'executive-summary', type: 'executive-summary', title: 'Resumo Executivo', visible: true, order: 0 },
    { id: 'priority-alerts', type: 'priority-alerts', title: 'Alertas Prioritários', visible: true, order: 1 },
    { id: 'status-overview', type: 'status-overview', title: 'Status da Frota', visible: true, order: 2 },
    { id: 'quick-actions', type: 'quick-actions', title: 'Ações Rápidas', visible: true, order: 3 }
  ])
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [showSystemConfig, setShowSystemConfig] = useState(false)
  const searchInputRef = useRef(null)

  // Tabs configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <Eye />,
      description: 'Métricas essenciais e alertas críticos'
    },
    {
      id: 'equipment',
      label: 'Equipamentos',
      icon: <Database />,
      description: 'Lista e status dos equipamentos'
    },
    {
      id: 'maintenance',
      label: 'Manutenções',
      icon: <Wrench />,
      description: 'Registre e gerencie manutenções'
    },
    {
      id: 'analysis',
      label: 'Análise Detalhada',
      icon: <BarChart />,
      description: 'Métricas avançadas e tendências'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Cog />,
      description: 'Personalização e configurações'
    }
  ]

  // Aplicar tema
  useEffect(() => {
    document.body.className = `theme-${theme}`
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Tentando conectar ao backend:', `${API_BASE}/dashboard`)
      const response = await axios.get(`${API_BASE}/dashboard`)
      console.log('Resposta do backend:', response.data)
      setDashboardData(response.data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Erro detalhado:', err)
      console.error('Status:', err.response?.status)
      console.error('Data:', err.response?.data)
      
      // Dados de fallback para demonstração
      if (err.code === 'ERR_NETWORK' || err.response?.status === 0) {
        setError('Backend não está acessível. Verifique se está rodando em http://localhost:8000')
        // Dados de exemplo para demonstração
        setDashboardData({
          "OK": 45,
          "AMARELO": 3,
          "VERMELHO": 1,
          "SEM": 68,
          "ultima_atualizacao": "2025-06-25"
        })
      } else {
        setError(`Erro ao carregar dados do dashboard: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipmentList = async () => {
    try {
      console.log('Tentando carregar equipamentos:', `${API_BASE}/equipment`)
      const response = await axios.get(`${API_BASE}/equipment`)
      console.log('Equipamentos carregados:', response.data.length)
      setEquipmentList(response.data)
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err)
      console.error('Status:', err.response?.status)
      console.error('Data:', err.response?.data)
      
      // Dados de exemplo para demonstração
      if (err.code === 'ERR_NETWORK' || err.response?.status === 0) {
        setEquipmentList([
          {
            "tag": "EXCAVADORA-001",
            "tipo": "HORAS",
            "intervalo": 0,
            "ultima_manut": 1250,
            "atual": 1450,
            "ultima_atualizacao": "2025-06-25"
          },
          {
            "tag": "CAMINHAO-002",
            "tipo": "HORAS", 
            "intervalo": 0,
            "ultima_manut": 800,
            "atual": 950,
            "ultima_atualizacao": "2025-06-25"
          },
          {
            "tag": "CARRO-003 (KM)",
            "tipo": "KM",
            "intervalo": 0,
            "ultima_manut": 45000,
            "atual": 52000,
            "ultima_atualizacao": "2025-06-25"
          }
        ])
      }
    }
  }

  const triggerImport = async () => {
    try {
      await axios.post(`${API_BASE}/import`)
      alert('Importação iniciada! Os dados serão atualizados em breve.')
      setTimeout(fetchDashboardData, 2000)
    } catch (err) {
      alert('Erro ao iniciar importação')
      console.error('Erro:', err)
    }
  }

  const exportData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/export`, {
        responseType: 'blob'
      })
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fleet_care_status_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
    } catch (err) {
      alert('Erro ao exportar dados')
      console.error('Erro:', err)
    }
  }

  const sendReport = async () => {
    try {
      await axios.post(`${API_BASE}/send-report`)
      alert('Relatório enviado por email!')
    } catch (err) {
      alert('Erro ao enviar relatório')
      console.error('Erro:', err)
    }
  }

  const handleUpdate = () => {
    fetchDashboardData()
    fetchEquipmentList()
  }

  // Busca Global
  const performGlobalSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results = []

    // Buscar em equipamentos
    const equipmentMatches = equipmentList.filter(equipment =>
      equipment.tag.toLowerCase().includes(query.toLowerCase()) ||
      equipment.tipo.toLowerCase().includes(query.toLowerCase())
    )
    results.push(...equipmentMatches.map(item => ({
      ...item,
      type: 'equipment',
      title: item.tag,
      subtitle: `Tipo: ${item.tipo}`,
      icon: <Database size={16} />
    })))

    // Buscar em manutenções (se disponível)
    try {
      const maintenanceResponse = await axios.get(`${API_BASE}/maintenance`)
      const maintenanceMatches = (maintenanceResponse.data.manutencoes || []).filter(maintenance =>
        maintenance.tag.toLowerCase().includes(query.toLowerCase()) ||
        maintenance.tipo_manutencao.toLowerCase().includes(query.toLowerCase())
      )
      results.push(...maintenanceMatches.map(item => ({
        ...item,
        type: 'maintenance',
        title: item.tag,
        subtitle: `${item.tipo_manutencao} - ${format(new Date(item.data_agendada), 'dd/MM/yyyy')}`,
        icon: <Wrench size={16} />
      })))
    } catch (err) {
      console.log('Erro ao buscar manutenções:', err)
    }

    // Buscar em fornecedores (se disponível)
    try {
      const suppliersResponse = await axios.get(`${API_BASE}/suppliers`)
      const supplierMatches = (suppliersResponse.data.fornecedores || []).filter(supplier =>
        supplier.nome.toLowerCase().includes(query.toLowerCase()) ||
        supplier.especialidade.toLowerCase().includes(query.toLowerCase())
      )
      results.push(...supplierMatches.map(item => ({
        ...item,
        type: 'supplier',
        title: item.nome,
        subtitle: item.especialidade,
        icon: <Building size={16} />
      })))
    } catch (err) {
      console.log('Erro ao buscar fornecedores:', err)
    }

    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSearchResultClick = (result) => {
    setShowGlobalSearch(false)
    setSearchQuery('')
    
    switch (result.type) {
      case 'equipment':
        setActiveTab('equipment')
        break
      case 'maintenance':
        setActiveTab('maintenance')
        break
      case 'supplier':
        setActiveTab('suppliers')
        break
    }
  }

  // Atalho de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowGlobalSearch(true)
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focar no input quando abrir busca
  useEffect(() => {
    if (showGlobalSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100)
    }
  }, [showGlobalSearch])

  // Buscar quando query mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performGlobalSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    fetchDashboardData()
    fetchEquipmentList()
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Dashboard Personalizável
  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ))
  }

  const reorderWidgets = (fromIndex, toIndex) => {
    const newWidgets = [...widgets]
    const [movedWidget] = newWidgets.splice(fromIndex, 1)
    newWidgets.splice(toIndex, 0, movedWidget)
    
    // Atualizar ordem
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }))
    
    setWidgets(updatedWidgets)
  }

  const resetDashboard = () => {
    setWidgets([
      { id: 'executive-summary', type: 'executive-summary', title: 'Resumo Executivo', visible: true, order: 0 },
      { id: 'priority-alerts', type: 'priority-alerts', title: 'Alertas Prioritários', visible: true, order: 1 },
      { id: 'status-overview', type: 'status-overview', title: 'Status da Frota', visible: true, order: 2 },
      { id: 'quick-actions', type: 'quick-actions', title: 'Ações Rápidas', visible: true, order: 3 }
    ])
    setDashboardLayout('grid')
  }

  const renderWidget = (widget) => {
    if (!widget.visible) return null

    switch (widget.type) {
      case 'executive-summary':
        return (
          <div key={widget.id} className="widget-container">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <div className="widget-actions">
                <button 
                  onClick={() => toggleWidget(widget.id)}
                  className="widget-action-btn"
                  title="Ocultar widget"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="executive-summary">
              <div className="section-header">
                <h2>Resumo Executivo</h2>
                <p>Visão de alto nível da operação da frota</p>
              </div>
              <div className="summary-grid">
                {/* Skeleton loading nos cards enquanto loading */}
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="summary-card skeleton" style={{ height: 140 }} />
                  ))
                ) : (
                  <>
                    <div className="summary-card">
                      <div className="summary-icon operational">
                        <Activity size={24} />
                      </div>
                      <div className="summary-content">
                        <h3>Disponibilidade Geral</h3>
                        <div className="summary-value">
                          {equipmentList.length > 0 
                            ? Math.round(((dashboardData?.OK || 0) / equipmentList.length) * 100)
                            : 0}%
                        </div>
                        <p className="summary-description">
                          Equipamentos operacionais e prontos para uso
                        </p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon warning">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="summary-content">
                        <h3>Risco Operacional</h3>
                        <div className="summary-value">
                          {dashboardData?.VERMELHO || 0}
                        </div>
                        <p className="summary-description">
                          Equipamentos em estado crítico que requerem atenção imediata
                        </p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon maintenance">
                        <Wrench size={24} />
                      </div>
                      <div className="summary-content">
                        <h3>Eficiência de Manutenção</h3>
                        <div className="summary-value">
                          {equipmentList.length > 0 
                            ? Math.round(((dashboardData?.OK || 0) / equipmentList.length) * 100)
                            : 0}%
                        </div>
                        <p className="summary-description">
                          Percentual de equipamentos com manutenção em dia
                        </p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon info">
                        <Target size={24} />
                      </div>
                      <div className="summary-content">
                        <h3>Status de Configuração</h3>
                        <div className="summary-value">
                          {equipmentList.filter(e => e.intervalo && e.intervalo > 0).length}
                        </div>
                        <p className="summary-description">
                          Equipamentos com intervalos de manutenção configurados
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'priority-alerts':
        return (
          <div key={widget.id} className="widget-container">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <div className="widget-actions">
                <button 
                  onClick={() => toggleWidget(widget.id)}
                  className="widget-action-btn"
                  title="Ocultar widget"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="priority-alerts">
              <div className="section-header">
                <h2>Alertas Prioritários</h2>
                <p>Equipamentos que requerem atenção imediata</p>
              </div>
              <div className="alerts-grid">
                {equipmentList.filter(equipment => {
                  if (!equipment.intervalo || equipment.intervalo === 0) return false
                  const uso = equipment.atual - equipment.ultima_manut
                  const percentual = (uso / equipment.intervalo) * 100
                  return percentual >= 100
                }).slice(0, 4).map((equipment, index) => {
                  const uso = equipment.atual - equipment.ultima_manut
                  const percentual = (uso / equipment.intervalo) * 100
                  const unit = equipment.tag.includes('(KM)') ? 'km' : 'horas'
                  
                  return (
                    <div key={equipment.tag} className={`priority-alert-card critical`}>
                      <div className="alert-header">
                        <div className="alert-icon">
                          <AlertTriangle size={20} />
                        </div>
                        <div className="alert-priority">
                          <span className="priority-badge critical">CRÍTICO</span>
                        </div>
                      </div>
                      <div className="alert-content">
                        <h3>{equipment.tag}</h3>
                        <div className="alert-metrics">
                          <div className="metric">
                            <span className="metric-label">Uso Atual</span>
                            <span className="metric-value critical">{equipment.atual} {unit}</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Intervalo</span>
                            <span className="metric-value">{equipment.intervalo} {unit}</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Excesso</span>
                            <span className="metric-value critical">{percentual.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="alert-action">
                          <button className="btn btn-sm btn-danger">
                            Agendar Manutenção
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {equipmentList.filter(equipment => {
                  if (!equipment.intervalo || equipment.intervalo === 0) return false
                  const uso = equipment.atual - equipment.ultima_manut
                  const percentual = (uso / equipment.intervalo) * 100
                  return percentual >= 100
                }).length === 0 && (
                  <div className="no-alerts">
                    <div className="no-alerts-icon">
                      <CheckCircle size={48} />
                    </div>
                    <h3>Nenhum Alerta Crítico</h3>
                    <p>Todos os equipamentos estão dentro dos intervalos de manutenção</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'status-overview':
        return (
          <div key={widget.id} className="widget-container">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <div className="widget-actions">
                <button 
                  onClick={() => toggleWidget(widget.id)}
                  className="widget-action-btn"
                  title="Ocultar widget"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="status-overview">
              <div className="section-header">
                <h2>Status da Frota</h2>
                <p>Visão geral do status operacional dos equipamentos</p>
              </div>
              <div className="status-cards-modern">
                <StatusCard
                  title="Operacional"
                  value={dashboardData?.OK || 0}
                  description="Equipamentos em operação normal"
                  icon={<CheckCircle />}
                  color="success"
                  trend="+2"
                  trendType="positive"
                />
                <StatusCard
                  title="Atenção"
                  value={dashboardData?.AMARELO || 0}
                  description="Equipamentos próximos do intervalo"
                  icon={<AlertTriangle />}
                  color="warning"
                  trend="+1"
                  trendType="neutral"
                />
                <StatusCard
                  title="Crítico"
                  value={dashboardData?.VERMELHO || 0}
                  description="Equipamentos fora do intervalo"
                  icon={<AlertTriangle />}
                  color="danger"
                  trend="-1"
                  trendType="negative"
                />
                <StatusCard
                  title="Sem Intervalo"
                  value={dashboardData?.SEM || 0}
                  description="Equipamentos sem configuração"
                  icon={<Settings />}
                  color="info"
                  trend="0"
                  trendType="neutral"
                />
              </div>
            </div>
          </div>
        )
      
      case 'quick-actions':
        return (
          <div key={widget.id} className="widget-container">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              <div className="widget-actions">
                <button 
                  onClick={() => toggleWidget(widget.id)}
                  className="widget-action-btn"
                  title="Ocultar widget"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="quick-actions">
              <div className="section-header">
                <h2>Ações Rápidas</h2>
                <p>Acesse rapidamente as funcionalidades principais</p>
              </div>
              <div className="actions-grid">
                <div className="action-card" onClick={() => setActiveTab('analysis')}>
                  <div className="action-icon">
                    <BarChart3 size={24} />
                  </div>
                  <div className="action-content">
                    <h3>Análise Detalhada</h3>
                    <p>Visualize métricas avançadas e tendências</p>
                  </div>
                </div>
                <div className="action-card" onClick={() => setShowIntervalModal(true)}>
                  <div className="action-icon">
                    <Settings size={24} />
                  </div>
                  <div className="action-content">
                    <h3>Configurar Intervalos</h3>
                    <p>Defina intervalos de manutenção personalizados</p>
                  </div>
                </div>
                <div className="action-card" onClick={() => setShowMaintenanceModal(true)}>
                  <div className="action-icon">
                    <Wrench size={24} />
                  </div>
                  <div className="action-content">
                    <h3>Nova Manutenção</h3>
                    <p>Registre uma nova manutenção no sistema</p>
                  </div>
                </div>
                <div className="action-card" onClick={() => setActiveTab('settings')}>
                  <div className="action-icon">
                    <Cog size={24} />
                  </div>
                  <div className="action-content">
                    <h3>Configurações</h3>
                    <p>Personalize o dashboard e preferências</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    )
  }

  const formatLastUpdate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <div className={`app theme-${theme}`}>
        {/* Header Profissional */}
        <header className="header-pro">
          <div className="header-pro-content">
            {/* Logo */}
            <div className="header-pro-logo">
              <img 
                src={logoArruda} 
                alt="Arruda" 
                style={{ height: 64, marginRight: 18, verticalAlign: 'middle', boxShadow: '0 2px 8px rgba(67,89,128,0.10)', borderRadius: 12, background: '#fff' }} 
              />
              <span className="header-pro-title" style={{ fontSize: '1.6rem', letterSpacing: '1px' }}>Arruda Fleet Care</span>
            </div>
            {/* Navegação Central */}
            <nav className="header-pro-nav">
              {tabs.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`header-pro-tab${activeTab === tab.id ? ' active' : ''}`}
                  title={tab.label}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
              </button>
              ))}
            </nav>
            {/* Ações à direita */}
            <div className="header-pro-actions">
              <button 
                onClick={() => setShowGlobalSearch(true)}
                className="header-pro-search-btn"
                title="Busca Global (Ctrl+K)"
              >
                <Search size={20} title="Busca Global" />
              </button>
              <button 
                onClick={toggleTheme}
                className="header-pro-theme-btn"
                title="Alternar tema claro/escuro"
              >
                {theme === 'light' ? <Moon size={20} title="Modo escuro" /> : <Sun size={20} title="Modo claro" />}
              </button>
              <div className="header-pro-avatar" title="Usuário">
                <span role="img" aria-label="avatar">👤</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'overview' && !loading && (
            <div className="dashboard-container">
              {/* Header Moderno */}
              <div className="dashboard-hero">
                <div className="hero-content">
                  <div className="hero-title">
                    <h1>Visão Geral da Frota</h1>
                    <p>Monitoramento inteligente e gestão proativa dos equipamentos</p>
                  </div>
                </div>
                <div style={{ fontSize: 16, color: '#aaa', textAlign: 'right', marginTop: 8 }}>
                  <strong>Última atualização da planilha:</strong><br />
                  {formatLastUpdate(dashboardData?.ultima_atualizacao)}
                </div>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => setShowIntervalModal(true)}>
                    <Settings size={16} />
                    Configurar Intervalos
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowWidgetSettings(true)}>
                    <Cog size={16} />
                    Personalizar Dashboard
                  </button>
                  <button className="btn btn-secondary" onClick={handleUpdate}>
                    <RefreshCw size={16} />
                    Atualizar
                </button>
                </div>
              </div>

              {/* Widgets Personalizáveis */}
              {widgets
                .filter(widget => widget.visible)
                .sort((a, b) => a.order - b.order)
                .map(widget => renderWidget(widget))
              }
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1>Equipamentos</h1>
                <p>Gerencie e monitore todos os equipamentos da sua frota</p>
              </div>
              <EquipmentFilters equipmentList={equipmentList} onFilterChange={setFilters} filters={filters} />
              <EquipmentTable equipmentList={equipmentList} filters={filters} />
            </div>
          )}

          {/* Análise Detalhada */}
          {activeTab === 'analysis' && (
            <div className="dashboard-container">
              <div className="dashboard-hero">
                <div className="hero-title">
                  <h1>Análise Detalhada</h1>
                  <p>Métricas avançadas e insights sobre a performance da frota</p>
                </div>
              </div>

              {/* Resumo Rápido */}
              <div className="metrics-overview" style={{marginTop: 24}}>
                <div className="metrics-grid">
                  {/* Apenas 2 cards principais */}
                  <div className="metric-card-modern">
                    <div className="metric-icon operational">
                      <Activity size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Disponibilidade Geral</h3>
                      <div className="metric-value">
                        {equipmentList.length > 0 
                          ? Math.round(((dashboardData?.OK || 0) / equipmentList.length) * 100)
                          : 0}%
                      </div>
                      <div className="metric-percentage">
                        Equipamentos operacionais
                      </div>
                    </div>
                  </div>
                  <div className="metric-card-modern">
                    <div className="metric-icon warning">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="metric-content">
                      <h3>Risco Operacional</h3>
                      <div className="metric-value">
                        {dashboardData?.VERMELHO || 0}
                      </div>
                      <div className="metric-percentage">
                        Equipamentos em estado crítico
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tendências */}
              <div className="trends-analysis" style={{marginTop: 32}}>
                <div className="section-header">
                  <h2>Tendências Recentes</h2>
                </div>
                <div className="trends-grid">
                  {/* Apenas 2 cards de tendência */}
                  <div className="trend-card">
                    <div className="trend-header">
                      <div className="trend-icon positive">
                        <TrendingUp size={20} />
                      </div>
                      <div className="trend-title">
                        <h3>Disponibilidade</h3>
                        <span className="trend-period">Últimos 30 dias</span>
                      </div>
                    </div>
                    <div className="trend-content">
                      <div className="trend-main-value">
                        {equipmentList.length > 0 
                          ? Math.round(((dashboardData?.OK || 0) / equipmentList.length) * 100)
                          : 0}%
                      </div>
                      <div className="trend-comparison">
                        <span className="trend-change positive">+2.5%</span>
                        <span className="trend-label">vs mês anterior</span>
                      </div>
                      <p className="trend-description">
                        Disponibilidade da frota melhorou.
                      </p>
                    </div>
                  </div>
                  <div className="trend-card">
                    <div className="trend-header">
                      <div className="trend-icon negative">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="trend-title">
                        <h3>Alertas Críticos</h3>
                        <span className="trend-period">Últimos 30 dias</span>
                      </div>
                    </div>
                    <div className="trend-content">
                      <div className="trend-main-value">
                        {dashboardData?.VERMELHO || 0}
                      </div>
                      <div className="trend-comparison">
                        <span className="trend-change negative">+1</span>
                        <span className="trend-label">vs semana anterior</span>
                      </div>
                      <p className="trend-description">
                        Pequeno aumento nos alertas críticos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="dashboard-charts" style={{marginTop: 32}}>
                <div className="section-header">
                  <h2>Gráficos e Análises</h2>
                </div>
                <DashboardCharts 
                  equipmentList={equipmentList}
                  dashboardData={dashboardData}
                />
              </div>
            </div>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <div className="dashboard-container">
              <div className="dashboard-hero">
                <div className="hero-title" style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <Cog size={32} style={{color: '#6366f1'}} />
                  <div>
                    <h1 style={{margin: 0}}>Configurações</h1>
                    <p style={{margin: 0}}>Personalize o sistema, preferências e integrações</p>
                  </div>
                </div>
              </div>

              <div className="settings-sections" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32}}>
                {/* Configuração de Intervalos */}
                <div className="settings-card" style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, padding: 32, background: '#fff'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                    <Clock size={24} style={{color: '#6366f1'}} />
                    <h2 style={{margin: 0, fontSize: 20}}>Configuração de Intervalos</h2>
                  </div>
                  <p style={{marginBottom: 18}}>Gerencie os intervalos de manutenção dos equipamentos.</p>
                  <button className="btn btn-primary" onClick={() => setShowIntervalModal(true)}>
                    <Settings size={16} /> Configurar Intervalos
                  </button>
                </div>

                {/* Gestão de Manutenções */}
                <div className="settings-card" style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, padding: 32, background: '#fff'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                    <Wrench size={24} style={{color: '#6366f1'}} />
                    <h2 style={{margin: 0, fontSize: 20}}>Gestão de Manutenções</h2>
                  </div>
                  <p style={{marginBottom: 18}}>Registre e visualize o histórico completo de manutenções.</p>
                  <button className="btn btn-primary" onClick={() => setShowMaintenanceModal(true)}>
                    <Wrench size={16} /> Nova Manutenção
                  </button>
                </div>

                {/* Gestão de Fornecedores */}
                <div className="settings-card" style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, padding: 32, background: '#fff'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                    <Users size={24} style={{color: '#6366f1'}} />
                    <h2 style={{margin: 0, fontSize: 20}}>Gestão de Fornecedores</h2>
                  </div>
                  <p style={{marginBottom: 18}}>Gerencie fornecedores e contratos de manutenção.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('suppliers')}>
                    <Users size={16} /> Gerenciar Fornecedores
                  </button>
                </div>

                {/* Configurações do Sistema */}
                <div className="settings-card" style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, padding: 32, background: '#fff'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                    <Cog size={24} style={{color: '#6366f1'}} />
                    <h2 style={{margin: 0, fontSize: 20}}>Configurações do Sistema</h2>
                  </div>
                  <p style={{marginBottom: 18}}>Personalize temas, notificações e preferências gerais.</p>
                  <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                    <button className="btn btn-secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      <Sun size={16} /> Alternar Tema
                    </button>
                    <button className="btn btn-secondary" onClick={handleUpdate}>
                      <RefreshCw size={16} /> Atualizar Dados
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowSystemConfig(true)}>
                      <Database size={16} /> Configurar Importação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manutenções */}
          {activeTab === 'maintenance' && (
            <div className="dashboard-container">
              <div className="dashboard-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <Wrench size={32} style={{color: '#6366f1'}} />
                  <div>
                    <h1 style={{margin: 0}}>Manutenções</h1>
                    <p style={{margin: 0}}>Registre, visualize e gerencie as manutenções dos equipamentos</p>
                  </div>
                </div>
                <button className="btn btn-primary" style={{fontSize: 18, padding: '12px 28px'}} onClick={() => setShowMaintenanceModal(true)}>
                  <Wrench size={18} style={{marginRight: 8}} /> Nova Manutenção
                </button>
              </div>
              {/* Card de filtros pode ser adicionado aqui futuramente */}
              <div style={{boxShadow: '0 4px 24px rgba(80,80,120,0.10)', borderRadius: 16, background: '#fff', padding: 32, marginBottom: 32}}>
                <MaintenanceList 
                  maintenanceData={maintenanceData}
                  onAddMaintenance={() => setShowMaintenanceModal(true)}
                  onViewDetail={(maintenance) => {
                    setSelectedMaintenance(maintenance)
                    setShowMaintenanceDetail(true)
                  }}
                />
              </div>
            </div>
          )}

          {/* Fornecedores */}
          {activeTab === 'suppliers' && (
            <SupplierManagement 
              supplierData={supplierData}
              onAddSupplier={() => {/* Implementar */}}
              onEditSupplier={() => {/* Implementar */}}
              onDeleteSupplier={() => {/* Implementar */}}
            />
          )}
        </div>

        {/* Maintenance Detail Modal */}
        {selectedMaintenance && (
          <MaintenanceDetail 
            maintenanceId={selectedMaintenance.id}
            onClose={() => setSelectedMaintenance(null)}
          />
        )}

        {/* Global Search Modal */}
        {showGlobalSearch && (
          <div className="modal-overlay" onClick={() => setShowGlobalSearch(false)}>
            <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
              <div className="global-search-header">
                <div className="global-search-input-wrapper">
                  <Search size={20} className="global-search-icon" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar equipamentos, manutenções, fornecedores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="global-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="global-search-clear"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowGlobalSearch(false)}
                  className="global-search-close"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="global-search-results">
                {isSearching ? (
                  <div className="global-search-loading">
                    <div className="loading-spinner"></div>
                    <span>Buscando...</span>
                  </div>
                ) : searchQuery ? (
                  searchResults.length > 0 ? (
                    <div className="global-search-list">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id || index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="global-search-item"
                        >
                          <div className="global-search-item-icon">
                            {result.icon}
                          </div>
                          <div className="global-search-item-content">
                            <div className="global-search-item-title">
                              {result.title}
                            </div>
                            <div className="global-search-item-subtitle">
                              {result.subtitle}
                            </div>
                          </div>
                          <div className="global-search-item-type">
                            {result.type === 'equipment' && 'Equipamento'}
                            {result.type === 'maintenance' && 'Manutenção'}
                            {result.type === 'supplier' && 'Fornecedor'}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="global-search-empty">
                      <Search size={48} />
                      <h3>Nenhum resultado encontrado</h3>
                      <p>Tente buscar por outro termo</p>
                    </div>
                  )
                ) : (
                  <div className="global-search-placeholder">
                    <Search size={48} />
                    <h3>Busca Global</h3>
                    <p>Digite para buscar em equipamentos, manutenções e fornecedores</p>
                    <div className="global-search-shortcuts">
                      <span>Pressione <kbd>Ctrl+K</kbd> para abrir rapidamente</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Widget Settings Modal */}
        {showWidgetSettings && (
          <div className="modal-overlay" onClick={() => setShowWidgetSettings(false)}>
            <div className="widget-settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="widget-settings-header">
                <h2>Personalizar Dashboard</h2>
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="widget-settings-content">
                <div className="layout-section">
                  <h3>Layout</h3>
                  <div className="layout-options">
                    <button
                      className={`layout-option ${dashboardLayout === 'grid' ? 'active' : ''}`}
                      onClick={() => setDashboardLayout('grid')}
                    >
                      <div className="layout-preview grid-preview"></div>
                      <span>Grid</span>
                    </button>
                    <button
                      className={`layout-option ${dashboardLayout === 'list' ? 'active' : ''}`}
                      onClick={() => setDashboardLayout('list')}
                    >
                      <div className="layout-preview list-preview"></div>
                      <span>Lista</span>
                    </button>
                  </div>
                </div>
                
                <div className="widgets-section">
                  <h3>Widgets</h3>
                  <div className="widgets-list">
                    {widgets.map((widget, index) => (
                      <div key={widget.id} className="widget-item">
                        <div className="widget-item-info">
                          <h4>{widget.title}</h4>
                          <p>{widget.visible ? 'Visível' : 'Oculto'}</p>
                        </div>
                        <div className="widget-item-actions">
                          <button
                            onClick={() => toggleWidget(widget.id)}
                            className={`widget-toggle-btn ${widget.visible ? 'active' : ''}`}
                          >
                            {widget.visible ? 'Ocultar' : 'Mostrar'}
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => reorderWidgets(index, index - 1)}
                              className="widget-move-btn"
                              title="Mover para cima"
                            >
                              ↑
                            </button>
                          )}
                          {index < widgets.length - 1 && (
                            <button
                              onClick={() => reorderWidgets(index, index + 1)}
                              className="widget-move-btn"
                              title="Mover para baixo"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="widget-settings-footer">
                <button
                  onClick={resetDashboard}
                  className="btn btn-outline"
                >
                  Resetar Padrão
                </button>
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="btn btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interval Config Modal */}
        {showIntervalModal && (
          <div className="modal-overlay" onClick={() => setShowIntervalModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Configurar Intervalos</h2>
                <button
                  onClick={() => setShowIntervalModal(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <IntervalConfig
                  equipmentList={equipmentList}
                  onUpdate={handleUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {/* System Config Modal */}
        {showSystemConfig && (
          <div className="modal-overlay" onClick={() => setShowSystemConfig(false)}>
            <div className="system-config-modal" onClick={(e) => e.stopPropagation()}>
              <div className="system-config-header">
                <h2>Configurar Importação</h2>
                <button
                  onClick={() => setShowSystemConfig(false)}
                  className="modal-close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="system-config-content">
                <SystemConfig
                  onClose={() => setShowSystemConfig(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App 