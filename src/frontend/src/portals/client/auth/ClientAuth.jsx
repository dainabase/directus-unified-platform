/**
 * ClientAuth — Client portal login page
 * Magic link: enter email → find in people → localStorage token → redirect
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import { useClientAuth } from '../hooks/useClientAuth'

const ClientAuth = () => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { loginByEmail } = useClientAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStep('loading')
    setErrorMsg('')
    try {
      await loginByEmail(email.trim().toLowerCase())
      setStep('success')
      setTimeout(() => navigate('/client'), 1500)
    } catch (err) {
      setStep('error')
      setErrorMsg(err.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Client</h1>
          <p className="text-gray-500 mt-1">HYPERVISUAL Switzerland</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
          {step === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie</h2>
              <p className="text-gray-500">Redirection vers votre espace...</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Connexion</h2>
              <p className="text-sm text-gray-500 mb-6">
                Entrez votre adresse email pour accéder à votre espace
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={step === 'loading' || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {step === 'loading' ? (
                    <><Loader2 size={18} className="animate-spin" /> Connexion en cours...</>
                  ) : (
                    <><ArrowRight size={18} /> Accéder à mon espace</>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-6">
                Pas encore de compte ? Contactez HYPERVISUAL pour obtenir votre accès.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientAuth
