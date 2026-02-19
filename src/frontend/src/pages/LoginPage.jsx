/**
 * LoginPage — Unified login for all portals.
 * Glassmorphism design, portal selector, JWT auth.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'

const PORTALS = [
  { value: 'superadmin', label: 'SuperAdmin', color: 'blue' },
  { value: 'client', label: 'Client', color: 'green' },
  { value: 'prestataire', label: 'Prestataire', color: 'purple' },
  { value: 'revendeur', label: 'Revendeur', color: 'orange' }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-black text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HYPERVISUAL</h1>
          <p className="text-sm text-gray-500 mt-1">Unified Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Connexion</h2>

          {/* Portal Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {PORTALS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPortal(p.value)}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  portal === p.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@hypervisual.ch"
                className="glass-input w-full"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="glass-input w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">
                <strong>Dev:</strong> Utilisez les identifiants Directus admin
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          HMF Corporation SA — Fribourg, Suisse
        </p>
      </div>
    </div>
  )
}

export default LoginPage
