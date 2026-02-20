/**
 * ProviderAuth — Provider portal login page
 * Magic link: enter email → find in providers → localStorage token → redirect
 * Theme: blue (#0071E3) — unified DS accent
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, Wrench } from 'lucide-react'
import { useProviderAuth } from '../hooks/useProviderAuth'

const ProviderAuth = () => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { loginByEmail } = useProviderAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStep('loading')
    setErrorMsg('')
    try {
      await loginByEmail(email.trim().toLowerCase())
      setStep('success')
      setTimeout(() => navigate('/prestataire'), 1500)
    } catch (err) {
      setStep('error')
      setErrorMsg(err.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0071E3] text-white mb-4">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Prestataire</h1>
          <p className="text-gray-500 mt-1">HYPERVISUAL Switzerland</p>
        </div>

        {/* Card */}
        <div className="ds-card p-8">
          {step === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion reussie</h2>
              <p className="text-gray-500">Redirection vers votre espace...</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Connexion</h2>
              <p className="text-sm text-gray-500 mb-6">
                Entrez votre adresse email pour acceder a votre espace prestataire
              </p>

              {step === 'error' && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setStep('email') }}
                      placeholder="votre@email.ch"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={step === 'loading' || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-[#0071E3] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {step === 'loading' ? (
                    <><Loader2 size={18} className="animate-spin" /> Connexion en cours...</>
                  ) : (
                    <><ArrowRight size={18} /> Acceder a mon espace</>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-6">
                Pas encore de compte ? Contactez HYPERVISUAL pour obtenir votre acces prestataire.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderAuth
