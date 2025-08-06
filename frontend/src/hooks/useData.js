import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const useData = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}${endpoint}`)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching data from ${endpoint}:`, err)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const mutate = useCallback((newData) => {
    setData(newData)
  }, [])

  useEffect(() => {
    fetchData()

    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.refetchInterval])

  return {
    data,
    error,
    loading,
    refetch: fetchData,
    mutate
  }
}

export default useData 