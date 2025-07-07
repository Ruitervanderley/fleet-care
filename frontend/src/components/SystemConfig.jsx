import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings, Save, TestTube, Download, Clock, Shield, FileText, Network, HardDrive, Cloud } from 'lucide-react'
import styles from './SystemConfig.module.css'

const API_BASE = 'http://localhost:8000'

const SystemConfig = () => {
  const [config, setConfig] = useState({
    importType: 'local',
    filePath: '',
    username: '',
    password: '',
    autoImport: true,
    importHour: '10',
    importMinute: '05',
    enabled: true
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [testing, setTesting] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/config`)
      if (response.data) {
        setConfig(response.data)
      }
    } catch (err) {
      console.log('Configuração não encontrada, usando padrões')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      await axios.post(`${API_BASE}/api/config`, config)
      setMessage('✅ Configurações salvas com sucesso!')
    } catch (err) {
      setMessage('❌ Erro ao salvar configurações: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setMessage('')
    
    try {
      const response = await axios.post(`${API_BASE}/api/config/test`, config)
      setMessage('✅ Conexão testada com sucesso! ' + response.data.detail)
    } catch (err) {
      setMessage('❌ Erro ao testar conexão: ' + (err.response?.data?.detail || err.message))
    } finally {
      setTesting(false)
    }
  }

  const importNow = async () => {
    setImporting(true)
    setMessage('')
    
    try {
      const response = await axios.post(`${API_BASE}/api/config/import`, config)
      setMessage('✅ Importação realizada com sucesso! ' + response.data.detail)
    } catch (err) {
      setMessage('❌ Erro na importação: ' + (err.response?.data?.detail || err.message))
    } finally {
      setImporting(false)
    }
  }

  const getImportTypeIcon = (type) => {
    switch (type) {
      case 'local': return <HardDrive size={16} />
      case 'network': return <Network size={16} />
      case 's3': return <Cloud size={16} />
      case 'ftp': return <Network size={16} />
      default: return <FileText size={16} />
    }
  }

  const getImportTypeLabel = (type) => {
    switch (type) {
      case 'local': return 'Arquivo Local'
      case 'network': return 'Rede/Compartilhamento'
      case 's3': return 'Amazon S3'
      case 'ftp': return 'FTP/SFTP'
      default: return 'Arquivo Local'
    }
  }

  return (
    <div className={styles.sysconfigBgPremium}>
      <div className={styles.sysconfigCardPremium}>
        <div className="card-header" style={{ marginBottom: 24 }}>
          <h2 className={styles.sysconfigTitle}>
            <Settings size={28} />
            Configurações do Sistema
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tipo de Origem:</label>
            <div className={styles.importTypeGrid}>
              {['local', 'network', 's3', 'ftp'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={
                    config.importType === type
                      ? `${styles.importTypeOption} ${styles.importTypeOptionActive}`
                      : styles.importTypeOption
                  }
                  onClick={() => setConfig({ ...config, importType: type })}
                >
                  {getImportTypeIcon(type)}
                  <span>{getImportTypeLabel(type)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Caminho/URL da Planilha:</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={config.filePath}
                onChange={(e) => setConfig({ ...config, filePath: e.target.value })}
                placeholder={
                  config.importType === 'local' ? 'C:\\Caminho\\Para\\planilha.xlsx' :
                  config.importType === 'network' ? '\\\\servidor\\compartilhamento\\planilha.xlsx' :
                  config.importType === 's3' ? 's3://bucket/planilha.xlsx' :
                  'ftp://servidor.com/planilha.xlsx'
                }
                className={styles.formInput}
                required
                style={{ flex: 1 }}
              />
              {config.importType === 'local' && (
                <>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    id="filePicker"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setConfig({ ...config, filePath: e.target.files[0].name })
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => document.getElementById('filePicker').click()}
                    style={{ minWidth: 120 }}
                  >
                    Buscar arquivo
                  </button>
                </>
              )}
            </div>
            <small className={styles.formHelp}>
              {config.importType === 'local' && 'Caminho completo do arquivo no servidor. O botão busca apenas o nome do arquivo no seu computador, mas o arquivo precisa estar acessível pelo backend.'}
              {config.importType === 'network' && 'Caminho UNC do compartilhamento de rede'}
              {config.importType === 's3' && 'URL do bucket S3 (ex: s3://meu-bucket/planilha.xlsx)'}
              {config.importType === 'ftp' && 'URL do servidor FTP/SFTP'}
            </small>
          </div>

          {(config.importType === 'network' || config.importType === 's3' || config.importType === 'ftp') && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Usuário:</label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="Nome do usuário"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Senha:</label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder="Senha do usuário"
                  className={styles.formInput}
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel + ' checkbox-label'}>
              <input
                type="checkbox"
                checked={config.autoImport}
                onChange={(e) => setConfig({ ...config, autoImport: e.target.checked })}
                className={styles.formCheckbox}
              />
              <span>Ativar importação automática</span>
            </label>
          </div>

          {config.autoImport && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Horário da Importação Automática:</label>
              <div className={styles.timeInputGroup}>
                <div>
                  <label className={styles.timeInputLabel}>Hora:</label>
                  <select
                    value={config.importHour}
                    onChange={(e) => setConfig({ ...config, importHour: e.target.value })}
                    className={styles.formSelect}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.timeSeparator}>:</div>
                <div>
                  <label className={styles.timeInputLabel}>Minuto:</label>
                  <select
                    value={config.importMinute}
                    onChange={(e) => setConfig({ ...config, importMinute: e.target.value })}
                    className={styles.formSelect}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <small className={styles.formHelp}>
                A importação será executada automaticamente todos os dias neste horário
              </small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel + ' checkbox-label'}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className={styles.formCheckbox}
              />
              <span>Sistema ativo</span>
            </label>
            <small className={styles.formHelp}>
              Desative para pausar todas as importações automáticas
            </small>
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={loading}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{ marginRight: 8 }}>553</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} style={{ marginRight: 8 }} />
                  Salvar Configurações
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={testConnection}
              disabled={testing || !config.filePath}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              {testing ? (
                <>
                  <span className="animate-spin" style={{ marginRight: 8 }}>553</span>
                  Testando...
                </>
              ) : (
                <>
                  <TestTube size={16} style={{ marginRight: 8 }} />
                  Testar Conexão
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={importNow}
              disabled={importing || !config.filePath}
              className={`${styles.btn} ${styles.btnSuccess}`}
            >
              {importing ? (
                <>
                  <span className="animate-spin" style={{ marginRight: 8 }}>553</span>
                  Importando...
                </>
              ) : (
                <>
                  <Download size={16} style={{ marginRight: 8 }} />
                  Importar Agora
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`${styles.alertItem} ${message.includes('✅') ? styles.alertSuccess : styles.alertDanger}`} style={{ justifyContent: 'center', fontWeight: 600 }}>
              {message.includes('✅') ? <Settings size={16} /> : <Shield size={16} />} {message}
            </div>
          )}
        </form>

        <div className="card" style={{ marginTop: 24, background: 'linear-gradient(90deg, #f1f5f9 60%, #e0e7ff 100%)', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(60,60,120,0.07)', border: '1.2px solid #e0e7ff' }}>
          <div className="card-header" style={{ borderBottom: 'none', background: 'none', paddingBottom: 0 }}>
            <h4 className="card-title" style={{ fontSize: 16, marginBottom: 0, color: '#6366f1', fontWeight: 700 }}>💡 Informações:</h4>
          </div>
          <div style={{ padding: '1rem 2rem', color: '#64748b', fontSize: 14 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Arquivo Local:</strong> Caminho direto no servidor (ex: C:\Dados\planilha.xlsx)</li>
              <li><strong>Rede:</strong> Compartilhamento Windows (ex: \\servidor\compartilhamento\planilha.xlsx)</li>
              <li><strong>S3:</strong> Bucket Amazon S3 (ex: s3://meu-bucket/planilha.xlsx)</li>
              <li><strong>FTP:</strong> Servidor FTP/SFTP (ex: ftp://servidor.com/planilha.xlsx)</li>
              <li>A importação automática executa diariamente no horário configurado</li>
              <li>Use "Testar Conexão" para verificar se o arquivo está acessível</li>
              <li>Use "Importar Agora" para executar uma importação manual</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemConfig 