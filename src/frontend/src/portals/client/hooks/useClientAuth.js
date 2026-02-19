/**
 * useClientAuth — Client portal authentication hook
 * Magic-link style: email lookup → localStorage token → auto-login
 */
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../../lib/axios'

const TOKEN_KEY = 'client_portal_token'
const CLIENT_KEY = 'client_portal_client'

export function useClientAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [clientId, setClientId] = useState(() => localStorage.getItem(CLIENT_KEY))
  const queryClient = useQueryClient()

  // Fetch client data from people collection
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client-profile', clientId],
    queryFn: async () => {
      if (!clientId) return null
      const { data } = await api.get(`/items/people/${clientId}`, {
        params: { fields: ['id', 'first_name', 'last_name', 'email', 'phone', 'position', 'company_id', 'owner_company'] }
      })
      return data?.data || null
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 10,
    retry: 1
  })

  const isAuthenticated = !!clientId && !!client

  // Login by email: find the person in Directus, set local token
  const loginByEmail = useCallback(async (email) => {
    const { data } = await api.get('/items/people', {
      params: {
        filter: { email: { _eq: email } },
        fields: ['id', 'first_name', 'last_name', 'email', 'company_id'],
        limit: 1
      }
    })
    const person = data?.data?.[0]
    if (!person) throw new Error('Aucun compte trouvé pour cet email')

    // Create a simple token (Base64 of id:email:timestamp)
    const tokenValue = btoa(`${person.id}:${person.email}:${Date.now()}`)
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(CLIENT_KEY, person.id)
    setToken(tokenValue)
    setClientId(person.id)
    queryClient.invalidateQueries({ queryKey: ['client-profile'] })
    return person
  }, [queryClient])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(CLIENT_KEY)
    setToken(null)
    setClientId(null)
    queryClient.clear()
  }, [queryClient])

  // If token exists but no clientId, try to extract from token
  useEffect(() => {
    if (token && !clientId) {
      try {
        const decoded = atob(token)
        const [id] = decoded.split(':')
        if (id) {
          localStorage.setItem(CLIENT_KEY, id)
          setClientId(id)
        }
      } catch {
        logout()
      }
    }
  }, [token, clientId, logout])

  return { client, isLoading, isAuthenticated, token, loginByEmail, logout }
}

export default useClientAuth
