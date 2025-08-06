import React, { useState, useCallback, useRef } from 'react'
import Select from 'react-select'
import debounce from 'lodash/debounce'
import { equipmentService } from '../services/equipmentService'

const EquipmentSelect = ({ 
  value, 
  onChange,
  tenantId,
  isActive = true,
  className,
  placeholder = "Selecione um equipamento"
}) => {
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const abortController = useRef(null)

  // Função para buscar equipamentos com debounce
  const fetchEquipments = useCallback(
    debounce(async (inputValue) => {
      try {
        // Cancela requisição anterior se existir
        if (abortController.current) {
          abortController.current.abort()
        }
        
        // Cria novo controller para esta requisição
        abortController.current = new AbortController()
        
        setIsLoading(true)
        setError(null)

        const result = await equipmentService.list({
          search: inputValue,
          tenantId,
          active: isActive,
          signal: abortController.current.signal
        })

        setOptions(result.options)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError('Falha ao carregar equipamentos')
        console.error('Erro ao buscar equipamentos:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [tenantId, isActive]
  )

  // Limpa controller ao desmontar
  React.useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  const handleInputChange = (newValue, { action }) => {
    if (action === 'input-change') {
      setSearch(newValue)
      fetchEquipments(newValue)
    }
  }

  const noOptionsMessage = ({ inputValue }) => {
    if (isLoading) return 'Carregando equipamentos...'
    if (error) return 'Falha ao carregar. Tentar novamente'
    if (inputValue) return 'Nenhum equipamento encontrado'
    return 'Digite para buscar equipamentos'
  }

  const handleRetry = () => {
    fetchEquipments(search)
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      noOptionsMessage={noOptionsMessage}
      placeholder={placeholder}
      className={className}
      isClearable
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 })
      }}
      {...(error && {
        components: {
          NoOptionsMessage: () => (
            <div className="select-error" onClick={handleRetry}>
              {error} - Clique para tentar novamente
            </div>
          )
        }
      })}
    />
  )
}

export default EquipmentSelect