/**
 * ProviderPortalGuard — Protects provider portal routes
 * Redirects to /prestataire/login if not authenticated
 */
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useProviderAuth } from '../hooks/useProviderAuth'

const ProviderPortalGuard = () => {
  const { isAuthenticated, isLoading } = useProviderAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/prestataire/login" replace />
  }

  return <Outlet />
}

export default ProviderPortalGuard
