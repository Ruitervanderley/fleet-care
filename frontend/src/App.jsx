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
import EquipmentTable from './components/EquipmentTable'
import IntervalConfig from './components/IntervalConfig'
import EquipmentFilters from './components/EquipmentFilters'
import DashboardCharts from './components/DashboardCharts'
import MaintenanceList from './components/MaintenanceList'
import MaintenanceDetail from './components/MaintenanceDetail'
import SupplierManagement from './components/SupplierManagement'
import SystemConfig from './components/SystemConfig'
import TrendAnalysis from './components/TrendAnalysis'
import logoArruda from './assets/logo-arruda.png'
import StatusCard from './components/StatusCard'
import OverviewPage from './pages/OverviewPage'
import PredictiveAnalysis from './components/PredictiveAnalysis'
import AdvancedReports from './components/AdvancedReports'
import WidgetSettingsModal from './components/WidgetSettingsModal'
import { ToastProvider, useToast } from './components/ToastContainer'

const API_BASE = 'http://localhost:8000'

function AppContent() {
  const [activeTab, setActiveTab] = useState('overview')
  const { showSuccess, showError, showInfo } = useToast()
  
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

  // Tabs configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <BarChart3 />,
      description: 'Métricas essenciais e alertas críticos'
    },
    {
      id: 'equipment',
      label: 'Equipamentos',
      icon: <Truck />,
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
      icon: <TrendingUp />,
      description: 'Métricas avançadas e tendências'
    },
    {
      id: 'suppliers',
      label: 'Fornecedores',
      icon: <Building />,
      description: 'Gerencie fornecedores e contratos'
    },
    {
      id: 'trends',
      label: 'Tendências',
      icon: <LineChart />,
      description: 'Análise de tendências e previsões'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings />,
      description: 'Configurações do sistema e personalização'
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
      console.log('Tentando conectar ao backend:', `${API_BASE}/dashboard`)
      const response = await axios.get(`${API_BASE}/dashboard`)
      console.log('Resposta do backend:', response.data)
      setDashboardData(response.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError('Erro ao conectar com o backend')
        setDashboardData({
        OK: 0,
        AMARELO: 0,
        VERMELHO: 0,
        SEM: 0,
        ultima_atualizacao: new Date().toLocaleString('pt-BR')
      })
    }
  }

  const fetchEquipmentData = async () => {
    try {
      console.log('Tentando carregar equipamentos:', `${API_BASE}/equipment`)
      const response = await axios.get(`${API_BASE}/equipment`)
      console.log('Equipamentos carregados:', response.data.length)
      setEquipmentList(response.data)
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err)
      if (err.response?.status !== 404) {
        setEquipmentList([
          { id: 1, nome: 'Equipamento Exemplo', status: 'SEM', tipo: 'Caminhão', modelo: 'Modelo X' }
        ])
      }
    }
  }

  const fetchMaintenanceData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/maintenance`)
      if (response.data && Array.isArray(response.data)) {
        setMaintenanceData(response.data)
      }
    } catch (err) {
      console.error('Erro ao buscar manutenções:', err)
      setMaintenanceData([
        { id: 1, equipamento: 'Equipamento 1', tipo: 'Preventiva', status: 'Pendente', data: '2024-01-15', prioridade: 'Alta' },
        { id: 2, equipamento: 'Equipamento 2', tipo: 'Corretiva', status: 'Em Andamento', data: '2024-01-10', prioridade: 'Média' },
        { id: 3, equipamento: 'Equipamento 3', tipo: 'Preventiva', status: 'Concluída', data: '2024-01-05', prioridade: 'Baixa' }
      ])
    }
  }

  const fetchSupplierData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers`)
      if (response.data && Array.isArray(response.data)) {
        setSupplierData(response.data)
      }
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err)
      setSupplierData([
        { id: 1, nome: 'Fornecedor A', categoria: 'Peças', contato: 'contato@fornecedora.com', status: 'Ativo' },
        { id: 2, nome: 'Fornecedor B', categoria: 'Serviços', contato: 'contato@fornecedorb.com', status: 'Ativo' }
      ])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchDashboardData(),
        fetchEquipmentData(),
        fetchMaintenanceData(),
        fetchSupplierData()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  const triggerImport = async () => {
    try {
      showInfo('Iniciando importação...')
      await axios.post(`${API_BASE}/import`)
      showSuccess('Importação iniciada! Os dados serão atualizados em breve.')
      setTimeout(fetchDashboardData, 2000)
    } catch (err) {
      showError('Erro ao iniciar importação. Tente novamente.')
      console.error('Erro:', err)
    }
  }

  const exportData = async () => {
    try {
      showInfo('Iniciando exportação...')
      const response = await axios.get(`${API_BASE}/export`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fleet_care_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSuccess('Dados exportados com sucesso!')
    } catch (err) {
      showError('Erro ao exportar dados. Tente novamente.')
      console.error('Erro:', err)
    }
  }

  const handleUpdate = async () => {
    setLoading(true)
    await fetchDashboardData()
    await fetchEquipmentData()
    setLoading(false)
    setLastUpdate(new Date())
    showSuccess('Dados atualizados com sucesso!')
  }

  const sendReportEmail = async () => {
    try {
      showInfo('Enviando relatório por email...')
      await axios.post(`${API_BASE}/send-report`)
      showSuccess('Relatório enviado por email!')
    } catch (err) {
      showError('Erro ao enviar relatório. Tente novamente.')
      console.error('Erro:', err)
    }
  }

  const formatLastUpdate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateStr
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

  return (
    <div className={`app theme-${theme}`} style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
        <header className="header-pro">
          <div className="header-pro-content">
            <div className="header-pro-logo">
              <img
                src={logoArruda}
                alt="Arruda"
                style={{ height: 64, marginRight: 18, verticalAlign: 'middle', boxShadow: '0 2px 8px rgba(67,89,128,0.10)', borderRadius: 12, background: '#fff' }}
              />
              <span className="header-pro-title" style={{ fontSize: '1.6rem', letterSpacing: '1px' }}>Arruda Fleet Care</span>
            </div>
            <nav className="header-pro-nav">
              {tabs.map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                className={`header-pro-tab ${activeTab === tab.id ? 'active' : ''}`}
                title={tab.description}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
              </button>
              ))}
            </nav>
            <div className="header-pro-actions">
              <button
                className="header-pro-search-btn"
              onClick={() => setShowGlobalSearch(!showGlobalSearch)}
              title="Busca global"
              >
              <Search size={20} />
              </button>
              <button
                className="header-pro-theme-btn"
              onClick={toggleTheme}
              title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            <div className="header-pro-avatar">
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: 'bold' 
              }}>
                A
              </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewPage
              widgets={widgets}
              loading={loading}
              dashboardData={dashboardData}
              equipmentList={equipmentList}
            onUpdate={handleUpdate}
            onExportData={exportData}
            onImportData={triggerImport}
              setShowWidgetSettings={setShowWidgetSettings}
              setWidgets={setWidgets}
            setShowIntervalModal={setShowIntervalModal}
            setShowMaintenanceModal={setShowMaintenanceModal}
            setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'equipment' && (
            <div className="card">
              <div className="card-header">
                <h1 className="card-title">Equipamentos</h1>
              </div>
              <EquipmentFilters equipmentList={equipmentList} onFilterChange={setFilters} filters={filters} />
              <EquipmentTable equipmentList={equipmentList} filters={filters} />
            </div>
          )}

        {activeTab === 'maintenance' && (
          <MaintenanceList
            maintenanceData={maintenanceData}
            onViewDetails={(maintenance) => {
              setSelectedMaintenance(maintenance)
              setShowMaintenanceDetail(true)
            }}
            onEdit={(maintenance) => {
              setSelectedMaintenance(maintenance)
              setShowMaintenanceModal(true)
            }}
            onDelete={(id) => {
              setMaintenanceData(prev => prev.filter(m => m.id !== id))
              showSuccess('Manutenção excluída com sucesso!')
            }}
            onAddMaintenance={() => {
              setSelectedMaintenance(null)
              setShowMaintenanceModal(true)
            }}
          />
        )}

          {activeTab === 'analysis' && (
            <div className="analysis-page">
              <div className="card">
                <div className="card-header">
                <h1 className="card-title">
                  <BarChart size={24} />
                  Análise Detalhada
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={exportData}>
                    <Download size={16} />
                    Exportar
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    <RefreshCw size={16} />
                    Atualizar
                  </button>
                </div>
              </div>
              <DashboardCharts dashboardData={dashboardData} equipmentList={equipmentList} />
              </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <TrendingUp size={20} />
                  Análise Preditiva
                </h2>
              </div>
              <PredictiveAnalysis equipmentList={equipmentList} maintenanceData={maintenanceData} />
            </div>

             <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <FileSpreadsheet size={20} />
                  Relatórios Avançados
                </h2>
              </div>
              <AdvancedReports 
                equipmentList={equipmentList} 
                maintenanceData={maintenanceData}
                dashboardData={dashboardData}
              />
            </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <SupplierManagement
            suppliers={supplierData}
            onAddSupplier={(supplier) => {
              const newSupplier = { ...supplier, id: Date.now() }
              setSupplierData(prev => [...prev, newSupplier])
              showSuccess('Fornecedor adicionado com sucesso!')
            }}
            onEditSupplier={(supplier) => {
              setSupplierData(prev => prev.map(s => s.id === supplier.id ? supplier : s))
              showSuccess('Fornecedor atualizado com sucesso!')
            }}
            onDeleteSupplier={(id) => {
              setSupplierData(prev => prev.filter(s => s.id !== id))
              showSuccess('Fornecedor excluído com sucesso!')
            }}
          />
        )}

        {activeTab === 'trends' && (
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">
                <LineChart size={24} />
                Análise de Tendências
              </h1>
            </div>
            <TrendAnalysis 
              equipmentList={equipmentList} 
              dashboardData={dashboardData} 
              maintenanceData={maintenanceData} 
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="card">
              <div className="card-header">
                <h1 className="card-title">
                  <Settings size={24} />
                  Configurações do Sistema
                </h1>
                </div>
              <div className="settings-section">
                <div className="action-grid">
                  <div className="action-card" onClick={() => setShowSystemConfig(true)}>
                    <div className="action-icon">
                      <Database size={24} />
              </div>
                    <div className="action-content">
                      <h3>Configurações Gerais</h3>
                      <p>Configure conexões e importações</p>
                  </div>
                          </div>
                  <div className="action-card" onClick={() => setShowIntervalModal(true)}>
                    <div className="action-icon">
                      <Clock size={24} />
                            </div>
                    <div className="action-content">
                      <h3>Intervalos de Manutenção</h3>
                      <p>Configure intervalos personalizados</p>
                            </div>
                          </div>
                  <div className="action-card" onClick={() => setShowWidgetSettings(true)}>
                    <div className="action-icon">
                      <Cog size={24} />
                          </div>
                    <div className="action-content">
                      <h3>Personalizar Dashboard</h3>
                      <p>Configure widgets e layout</p>
                    </div>
                    </div>
                    </div>
                  </div>
              </div>
            </div>
        )}
      </main>

      {/* Modals */}
      {showIntervalModal && (
        <div className="modal-overlay-new" onClick={() => setShowIntervalModal(false)}>
          <div className="modal-content-new modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <div className="modal-title-new">
                <Settings size={24} />
                Gerenciar Intervalos de Manutenção
              </div>
              <button
                className="modal-close-new"
                onClick={() => setShowIntervalModal(false)}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body-new">
              <IntervalConfig 
                equipmentList={equipmentList}
                onClose={() => setShowIntervalModal(false)}
                onSave={(data) => {
                  console.log('Saving interval data:', data)
                  setShowIntervalModal(false)
                  showSuccess('Intervalos configurados com sucesso!')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="modal-overlay-new" onClick={() => setShowMaintenanceModal(false)}>
            <div className="modal-content-new modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <h2 className="modal-title-new">
                <Wrench size={20} />
                {selectedMaintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
              </h2>
              <button
                className="modal-close-new"
                onClick={() => {
                  setShowMaintenanceModal(false)
                  setSelectedMaintenance(null)
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body-new">
              <form className="maintenance-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="equipment">Equipamento</label>
                    <select id="equipment" className="form-control" required>
                      <option value="">Selecione um equipamento</option>
                      {loading ? (
                        <option value="" disabled>Carregando equipamentos...</option>
                      ) : equipmentList.length === 0 ? (
                        <option value="" disabled>Nenhum equipamento disponível</option>
                      ) : (
                        equipmentList.map(eq => (
                          <option key={eq.tag} value={eq.tag}>{eq.tag}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="type">Tipo de Manutenção</label>
                    <select id="type" className="form-control" required>
                      <option value="">Selecione o tipo</option>
                      <option value="preventiva">Preventiva</option>
                      <option value="corretiva">Corretiva</option>
                      <option value="preditiva">Preditiva</option>
                    </select>
                </div>
                        </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Data</label>
                    <input type="date" id="date" className="form-control" required />
                        </div>
                  <div className="form-group">
                    <label htmlFor="priority">Prioridade</label>
                    <select id="priority" className="form-control" required>
                      <option value="">Selecione a prioridade</option>
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                      </div>
                  </div>
                <div className="form-group">
                  <label htmlFor="description">Descrição</label>
                  <textarea id="description" className="form-control" rows="3" placeholder="Descreva a manutenção..."></textarea>
                </div>
              <div className="form-actions">
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowMaintenanceModal(false)
                      setSelectedMaintenance(null)
                    }}
                  >
                    Cancelar
                </button>
                <button
                    type="submit"
                  className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      showSuccess('Manutenção salva com sucesso!')
                      setShowMaintenanceModal(false)
                      setSelectedMaintenance(null)
                    }}
                >
                  Salvar
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )}

      {showWidgetSettings && (
        <WidgetSettingsModal
          isOpen={showWidgetSettings}
          widgets={widgets}
          setWidgets={setWidgets}
          onClose={() => setShowWidgetSettings(false)}
          onSave={(newWidgets) => {
            setWidgets(newWidgets)
            setShowWidgetSettings(false)
            showSuccess('Configurações salvas com sucesso!')
          }}
        />
      )}

        {showSystemConfig && (
          <div className="modal-overlay" onClick={() => setShowSystemConfig(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SystemConfig onClose={() => setShowSystemConfig(false)} />
            </div>
          </div>
        )}

      {showMaintenanceDetail && selectedMaintenance && (
        <MaintenanceDetail
          maintenance={selectedMaintenance}
          onClose={() => {
            setShowMaintenanceDetail(false)
            setSelectedMaintenance(null)
          }}
        />
      )}
      </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App 