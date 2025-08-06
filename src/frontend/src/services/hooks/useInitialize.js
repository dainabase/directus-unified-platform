import { useEffect } from 'react'
import useStore from '../state/store'
import toast from 'react-hot-toast'

// Hook pour initialiser l'application
export const useInitialize = () => {
  const fetchCompanies = useStore(state => state.fetchCompanies)
  const fetchDashboardData = useStore(state => state.fetchDashboardData)
  const preferences = useStore(state => state.preferences)
  const isLoading = useStore(state => state.isLoading)
  const error = useStore(state => state.error)

  useEffect(() => {
    // Initialisation au montage
    const initialize = async () => {
      try {
        await fetchCompanies()
        await fetchDashboardData()
        toast.success('Dashboard chargé avec succès')
      } catch (error) {
        console.error('Initialization error:', error)
        toast.error('Erreur lors du chargement du dashboard')
      }
    }

    initialize()

    // Auto-refresh si activé
    let interval
    if (preferences.autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData()
      }, preferences.refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return { isLoading, error }
}