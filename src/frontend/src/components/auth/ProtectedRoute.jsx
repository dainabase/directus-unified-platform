/**
 * ProtectedRoute — Redirects to /login if not authenticated.
 * Checks portal access (superadmin, client, prestataire, revendeur).
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const ProtectedRoute = ({ children, allowedPortals = [] }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const portal = useAuthStore((s) => s.portal)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check portal access if restrictions are specified
  if (allowedPortals.length > 0 && !allowedPortals.includes(portal)) {
    // Redirect to the user's own portal
    const portalPaths = {
      superadmin: '/superadmin',
      client: '/client',
      prestataire: '/prestataire',
      revendeur: '/revendeur'
    }
    return <Navigate to={portalPaths[portal] || '/login'} replace />
  }

  return children
}

export default ProtectedRoute
