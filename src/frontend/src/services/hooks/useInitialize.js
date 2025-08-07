import { useEffect, useRef } from 'react'
import useStore from '../state/store'

export const useInitialize = () => {
  const initialized = useRef(false)
  const { fetchCompanies, fetchDashboardData } = useStore()

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initialize = async () => {
      try {
        console.log('🚀 Initialisation du dashboard')
        await fetchCompanies()
        await fetchDashboardData()
      } catch (error) {
        console.error('Erreur initialisation:', error)
      }
    }

    initialize()
  }, []) // Vide = une seule fois
}