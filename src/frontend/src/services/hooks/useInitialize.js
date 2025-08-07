import { useEffect, useRef } from 'react'
import useStore from '../state/store'

export const useInitialize = () => {
  const initialized = useRef(false)
  
  useEffect(() => {
    // Éviter la double initialisation
    if (initialized.current) return
    initialized.current = true
    
    // Initialisation simple sans appels API
    console.log('🚀 Dashboard initialisé en mode démo')
  }, []) // Pas de dépendances
}