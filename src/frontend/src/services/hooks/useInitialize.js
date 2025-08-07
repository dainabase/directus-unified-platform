import { useEffect, useRef } from 'react'
import useStore from '../state/store'

// Hook pour initialiser l'application
export const useInitialize = () => {
  const initialized = useRef(false)
  const { 
    fetchCompanies, 
    fetchDashboardData,
    setDemoMode,
    preferences,
    isLoading,
    error
  } = useStore(state => ({
    fetchCompanies: state.fetchCompanies,
    fetchDashboardData: state.fetchDashboardData,
    setDemoMode: state.setDemoMode,
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error
  }))

  useEffect(() => {
    // Éviter la double initialisation en dev
    if (initialized.current) return
    initialized.current = true

    const initialize = async () => {
      try {
        // Activer le mode démo par défaut
        setDemoMode(true)
        console.log('🚀 Initialisation du dashboard en mode démo')
        
        // Charger les données démo
        await fetchCompanies()
        await fetchDashboardData()
      } catch (error) {
        console.error('Erreur initialisation:', error)
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
  }, []) // Dépendances vides = une seule exécution

  return { isLoading, error }
}