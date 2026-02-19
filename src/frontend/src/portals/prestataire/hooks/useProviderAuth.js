/**
 * useProviderAuth — Provider portal authentication hook
 * Magic-link style: email lookup → localStorage token → auto-login
 * Pattern identique Phase C useClientAuth — adapté prestataire
 */
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../lib/axios'

const TOKEN_KEY = 'provider_portal_token'
const PROVIDER_KEY = 'provider_portal_provider'

export function useProviderAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [providerId, setProviderId] = useState(() => localStorage.getItem(PROVIDER_KEY))
  const queryClient = useQueryClient()

  // Fetch provider data from providers collection (joined with people via email)
  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider-profile', providerId],
    queryFn: async () => {
      if (!providerId) return null
      const { data } = await api.get(`/items/providers/${providerId}`, {
        params: { fields: ['id', 'name', 'email', 'phone', 'contact_person', 'specialty', 'status', 'company_id', 'owner_company'] }
      })
      return data?.data || null
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 10,
    retry: 1
  })

  const isAuthenticated = !!providerId && !!provider

  // Login by email: find the provider in Directus, set local token
  const loginByEmail = useCallback(async (email) => {
    // First check providers collection
    const { data } = await api.get('/items/providers', {
      params: {
        filter: { email: { _eq: email } },
        fields: ['id', 'name', 'email', 'contact_person', 'status'],
        limit: 1
      }
    })
    const providerRecord = data?.data?.[0]
    if (!providerRecord) throw new Error('Aucun compte prestataire trouvé pour cet email')
    if (providerRecord.status === 'suspended') throw new Error('Votre compte prestataire est suspendu')

    // Create a simple token (Base64 of id:email:timestamp)
    const tokenValue = btoa(`${providerRecord.id}:${providerRecord.email}:${Date.now()}`)
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(PROVIDER_KEY, providerRecord.id)
    setToken(tokenValue)
    setProviderId(providerRecord.id)
    queryClient.invalidateQueries({ queryKey: ['provider-profile'] })
    return providerRecord
  }, [queryClient])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROVIDER_KEY)
    setToken(null)
    setProviderId(null)
    queryClient.clear()
  }, [queryClient])

  // If token exists but no providerId, try to extract from token
  useEffect(() => {
    if (token && !providerId) {
      try {
        const decoded = atob(token)
        const [id] = decoded.split(':')
        if (id) {
          localStorage.setItem(PROVIDER_KEY, id)
          setProviderId(id)
        }
      } catch {
        logout()
      }
    }
  }, [token, providerId, logout])

  return { provider, isLoading, isAuthenticated, token, loginByEmail, logout }
}

export default useProviderAuth
