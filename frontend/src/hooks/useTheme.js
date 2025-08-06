import { useState, useEffect, useCallback } from 'react'
import { LOCAL_STORAGE_KEYS } from '../config/constants'

const defaultPreferences = {
  theme: 'light',
  dashboardLayout: 'grid',
  language: 'pt-BR',
  notifications: {
    email: true,
    push: true,
    desktop: true
  },
  charts: {
    defaultType: 'line',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  },
  table: {
    pageSize: 10,
    density: 'comfortable'
  },
  sidebar: {
    expanded: true,
    favorites: []
  }
}

export const useTheme = () => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.userPreferences)
    return saved ? JSON.parse(saved) : defaultPreferences
  })

  // Atualizar tema
  const setTheme = useCallback((theme) => {
    setPreferences(prev => ({
      ...prev,
      theme
    }))
  }, [])

  // Atualizar layout do dashboard
  const setDashboardLayout = useCallback((layout) => {
    setPreferences(prev => ({
      ...prev,
      dashboardLayout: layout
    }))
  }, [])

  // Atualizar idioma
  const setLanguage = useCallback((language) => {
    setPreferences(prev => ({
      ...prev,
      language
    }))
  }, [])

  // Atualizar configurações de notificação
  const updateNotificationSettings = useCallback((settings) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...settings
      }
    }))
  }, [])

  // Atualizar configurações de gráficos
  const updateChartSettings = useCallback((settings) => {
    setPreferences(prev => ({
      ...prev,
      charts: {
        ...prev.charts,
        ...settings
      }
    }))
  }, [])

  // Atualizar configurações de tabela
  const updateTableSettings = useCallback((settings) => {
    setPreferences(prev => ({
      ...prev,
      table: {
        ...prev.table,
        ...settings
      }
    }))
  }, [])

  // Alternar expansão da sidebar
  const toggleSidebar = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        expanded: !prev.sidebar.expanded
      }
    }))
  }, [])

  // Gerenciar favoritos da sidebar
  const toggleFavorite = useCallback((itemId) => {
    setPreferences(prev => {
      const favorites = prev.sidebar.favorites
      const newFavorites = favorites.includes(itemId)
        ? favorites.filter(id => id !== itemId)
        : [...favorites, itemId]

      return {
        ...prev,
        sidebar: {
          ...prev.sidebar,
          favorites: newFavorites
        }
      }
    })
  }, [])

  // Resetar preferências
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  // Salvar preferências no localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.userPreferences,
      JSON.stringify(preferences)
    )

    // Aplicar tema ao body
    document.body.className = `theme-${preferences.theme}`
  }, [preferences])

  return {
    preferences,
    setTheme,
    setDashboardLayout,
    setLanguage,
    updateNotificationSettings,
    updateChartSettings,
    updateTableSettings,
    toggleSidebar,
    toggleFavorite,
    resetPreferences
  }
}

export default useTheme 