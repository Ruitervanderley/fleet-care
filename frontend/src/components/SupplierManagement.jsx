import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  Search,
  Filter
} from 'lucide-react'

const API_BASE = 'http://localhost:8000'

const SupplierManagement = () => {
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')

  const [newSupplier, setNewSupplier] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    especialidade: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/suppliers`)
      setFornecedores(response.data.fornecedores || [])
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSupplier = async () => {
    try {
      await axios.post(`${API_BASE}/suppliers`, newSupplier)
      setShowCreateModal(false)
      setNewSupplier({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        especialidade: ''
      })
      fetchSuppliers()
      alert('Fornecedor criado com sucesso!')
    } catch (err) {
      alert('Erro ao criar fornecedor')
      console.error('Erro:', err)
    }
  }

  const updateSupplier = async () => {
    try {
      await axios.put(`${API_BASE}/suppliers/${editingSupplier.id}`, editingSupplier)
      setEditingSupplier(null)
      fetchSuppliers()
      alert('Fornecedor atualizado com sucesso!')
    } catch (err) {
      alert('Erro ao atualizar fornecedor')
      console.error('Erro:', err)
    }
  }

  const deleteSupplier = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

    try {
      await axios.delete(`${API_BASE}/suppliers/${id}`)
      fetchSuppliers()
      alert('Fornecedor excluído com sucesso!')
    } catch (err) {
      alert('Erro ao excluir fornecedor')
      console.error('Erro:', err)
    }
  }

  const filteredSuppliers = fornecedores.filter(supplier => {
    const matchesSearch = supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.cnpj?.includes(searchTerm) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = !filterSpecialty || supplier.especialidade === filterSpecialty
    return matchesSearch && matchesSpecialty
  })

  const specialties = [...new Set(fornecedores.map(s => s.especialidade).filter(Boolean))]

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner-suppliers"></div>
        <span>Carregando fornecedores...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="suppliers-header">
        <div>
          <h2>
            <Building size={28} />
            Gestão de Fornecedores
          </h2>
          <p>
            Gerencie fornecedores e prestadores de serviços
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-gradient-primary"
        >
          <Plus size={20} />
          Novo Fornecedor
        </button>
      </div>

      {/* Filtros */}
      <div className="suppliers-filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="">Todas as especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          <div className="suppliers-count">
            <span>
              {filteredSuppliers.length} de {fornecedores.length} fornecedores
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-card-header">
              <div className="supplier-info">
                <div className="supplier-icon">
                  <Building size={24} />
                </div>
                <div className="supplier-details">
                  <h3>{supplier.nome}</h3>
                  {supplier.especialidade && (
                    <div className="supplier-specialty">{supplier.especialidade}</div>
                  )}
                </div>
              </div>
              <div className="supplier-actions">
                <button
                  onClick={() => setEditingSupplier(supplier)}
                  className="supplier-action-btn edit"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteSupplier(supplier.id)}
                  className="supplier-action-btn delete"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="supplier-contact space-y-2">
              {supplier.cnpj && (
                <div className="contact-item">
                  <strong>CNPJ:</strong> {supplier.cnpj}
                </div>
              )}
              {supplier.telefone && (
                <div className="contact-item">
                  <Phone size={14} className="contact-icon" />
                  {supplier.telefone}
                </div>
              )}
              {supplier.email && (
                <div className="contact-item">
                  <Mail size={14} className="contact-icon" />
                  {supplier.email}
                </div>
              )}
              {supplier.endereco && (
                <div className="contact-item">
                  <MapPin size={14} className="contact-icon" />
                  {supplier.endereco}
                </div>
              )}
            </div>

            <div className="supplier-status">
              <span className={`status-badge ${supplier.ativo ? 'active' : 'inactive'}`}>
                {supplier.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="empty-state-suppliers">
          <Building size={48} />
          <h3>
            Nenhum fornecedor encontrado
          </h3>
          <p>
            {searchTerm || filterSpecialty ? 'Tente ajustar os filtros.' : 'Comece adicionando um novo fornecedor.'}
          </p>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="modal-suppliers">
          <div className="modal-suppliers-content">
            <h3>
              Novo Fornecedor
            </h3>
            
            <div className="space-y-4">
              <div className="supplier-form-group">
                <label>
                  Nome *
                </label>
                <input
                  type="text"
                  value={newSupplier.nome}
                  onChange={(e) => setNewSupplier({...newSupplier, nome: e.target.value})}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="supplier-form-group">
                <label>
                  CNPJ
                </label>
                <input
                  type="text"
                  value={newSupplier.cnpj}
                  onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="supplier-form-group">
                <label>
                  Telefone
                </label>
                <input
                  type="text"
                  value={newSupplier.telefone}
                  onChange={(e) => setNewSupplier({...newSupplier, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="supplier-form-group">
                <label>
                  Email
                </label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  placeholder="contato@empresa.com"
                />
              </div>

              <div className="supplier-form-group">
                <label>
                  Endereço
                </label>
                <textarea
                  value={newSupplier.endereco}
                  onChange={(e) => setNewSupplier({...newSupplier, endereco: e.target.value})}
                  rows={2}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="supplier-form-group">
                <label>
                  Especialidade
                </label>
                <input
                  type="text"
                  value={newSupplier.especialidade}
                  onChange={(e) => setNewSupplier({...newSupplier, especialidade: e.target.value})}
                  placeholder="Ex: Mecânica, Elétrica, Hidráulica"
                />
              </div>
            </div>

            <div className="supplier-form-actions">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={createSupplier}
                disabled={!newSupplier.nome}
                className="btn btn-gradient-primary"
              >
                Criar Fornecedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingSupplier && (
        <div className="modal-suppliers">
          <div className="modal-suppliers-content">
            <h3>
              Editar Fornecedor
            </h3>
            
            <div className="space-y-4">
              <div className="supplier-form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={editingSupplier.nome}
                  onChange={(e) => setEditingSupplier({...editingSupplier, nome: e.target.value})}
                />
              </div>

              <div className="supplier-form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  value={editingSupplier.cnpj || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, cnpj: e.target.value})}
                />
              </div>

              <div className="supplier-form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={editingSupplier.telefone || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, telefone: e.target.value})}
                />
              </div>

              <div className="supplier-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingSupplier.email || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                />
              </div>

              <div className="supplier-form-group">
                <label>Endereço</label>
                <textarea
                  value={editingSupplier.endereco || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, endereco: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="supplier-form-group">
                <label>Especialidade</label>
                <input
                  type="text"
                  value={editingSupplier.especialidade || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, especialidade: e.target.value})}
                />
              </div>
            </div>

            <div className="supplier-form-actions">
              <button
                onClick={() => setEditingSupplier(null)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={updateSupplier}
                disabled={!editingSupplier.nome}
                className="btn btn-gradient-primary"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierManagement 