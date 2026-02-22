/**
 * LoginPage — Unified login for all portals.
 * Apple Premium Design System — var(--accent-hover) accent only.
 */

import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'

const PORTALS = [
  { value: 'superadmin', label: 'SuperAdmin' },
  { value: 'client', label: 'Client' },
  { value: 'prestataire', label: 'Prestataire' },
  { value: 'revendeur', label: 'Revendeur' }
]

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const isLoading = useAuthStore((s) => s.isLoading)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [portal, setPortal] = useState('superadmin')
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || `/${portal}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const result = await login(email, password, portal)
    if (result.success) {
      const portalPaths = {
        superadmin: '/superadmin',
        client: '/client',
        prestataire: '/prestataire',
        revendeur: '/revendeur'
      }
      navigate(portalPaths[portal] || from, { replace: true })
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent-hover)', boxShadow: 'var(--shadow-md)' }}
          >
            <span className="text-2xl font-black text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
            HYPERVISUAL
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--label-3)' }}>
            Unified Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="ds-card p-8">
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: 'var(--label-1)' }}
          >
            Connexion
          </h2>

          {/* Portal Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {PORTALS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPortal(p.value)}
                className="py-2 px-2 rounded-lg text-xs font-medium transition-all"
                style={
                  portal === p.value
                    ? { background: 'var(--accent-hover)', color: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }
                    : { background: 'rgba(0,0,0,0.04)', color: 'var(--label-2)' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 mb-4 rounded-lg text-sm"
              style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', color: 'var(--semantic-red)' }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="ds-label"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@hypervisual.ch"
                className="ds-input w-full"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="ds-label"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ds-input w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--label-3)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="ds-btn ds-btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Dev hint */}
          {import.meta.env.DEV && (
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--sep)' }}
            >
              <p className="text-xs" style={{ color: 'var(--label-3)' }}>
                <strong>Dev:</strong> Utilisez les identifiants Directus admin
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--label-3)' }}>
          HYPERVISUAL Switzerland — Fribourg, Suisse
        </p>
      </div>
    </div>
  )
}

export default LoginPage
