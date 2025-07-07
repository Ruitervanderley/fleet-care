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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando fornecedores...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Fornecedores
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie fornecedores e prestadores de serviços
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Fornecedor
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas as especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredSuppliers.length} de {fornecedores.length} fornecedores
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Building className="text-blue-600" size={24} />
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{supplier.nome}</h3>
                  {supplier.especialidade && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">{supplier.especialidade}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingSupplier(supplier)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteSupplier(supplier.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {supplier.cnpj && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CNPJ: {supplier.cnpj}
                </p>
              )}
              {supplier.telefone && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Phone size={14} className="mr-2" />
                  {supplier.telefone}
                </p>
              )}
              {supplier.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Mail size={14} className="mr-2" />
                  {supplier.email}
                </p>
              )}
              {supplier.endereco && (
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                  <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                  {supplier.endereco}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                supplier.ativo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {supplier.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Nenhum fornecedor encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterSpecialty ? 'Tente ajustar os filtros.' : 'Comece adicionando um novo fornecedor.'}
          </p>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Novo Fornecedor
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newSupplier.nome}
                  onChange={(e) => setNewSupplier({...newSupplier, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={newSupplier.cnpj}
                  onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={newSupplier.telefone}
                  onChange={(e) => setNewSupplier({...newSupplier, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="contato@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço
                </label>
                <textarea
                  value={newSupplier.endereco}
                  onChange={(e) => setNewSupplier({...newSupplier, endereco: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={newSupplier.especialidade}
                  onChange={(e) => setNewSupplier({...newSupplier, especialidade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Mecânica, Elétrica, Hidráulica"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={createSupplier}
                disabled={!newSupplier.nome}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Fornecedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Editar Fornecedor
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editingSupplier.nome}
                  onChange={(e) => setEditingSupplier({...editingSupplier, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={editingSupplier.cnpj || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, cnpj: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={editingSupplier.telefone || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingSupplier.email || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço
                </label>
                <textarea
                  value={editingSupplier.endereco || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, endereco: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={editingSupplier.especialidade || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, especialidade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingSupplier(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={updateSupplier}
                disabled={!editingSupplier.nome}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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