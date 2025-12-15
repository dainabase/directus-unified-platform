/**
 * Client Portal Login Page
 *
 * Features:
 * - Email/Password login
 * - Password reset request
 * - Account activation
 * - Company branding
 *
 * @date 15 Décembre 2025
 */

import React, { useState } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const LoginPage = ({ onLoginSuccess, companyLogo, companyName = 'Espace Client' }) => {
  const { login, requestPasswordReset, isLoading, error } = useClientAuth();

  const [mode, setMode] = useState('login'); // login | forgot | success
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      onLoginSuccess?.();
    } else {
      setLocalError(result.error || 'Email ou mot de passe incorrect');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email) {
      setLocalError('Veuillez entrer votre adresse email');
      return;
    }

    const result = await requestPasswordReset(email);

    if (result.success) {
      setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse.');
      setMode('success');
    } else {
      setLocalError(result.error || 'Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo / Header */}
                <div className="text-center mb-4">
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="mb-3" style={{ height: '60px' }} />
                  ) : (
                    <div className="mb-3">
                      <span className="display-6 text-primary">👤</span>
                    </div>
                  )}
                  <h4 className="fw-bold">{companyName}</h4>
                  <p className="text-muted small">
                    {mode === 'login' && 'Connectez-vous à votre espace'}
                    {mode === 'forgot' && 'Réinitialisez votre mot de passe'}
                    {mode === 'success' && 'Email envoyé !'}
                  </p>
                </div>

                {/* Error Alert */}
                {(localError || error) && (
                  <div className="alert alert-danger py-2" role="alert">
                    <small>{localError || error}</small>
                  </div>
                )}

                {/* Success Message */}
                {mode === 'success' && (
                  <div className="alert alert-success py-2" role="alert">
                    <small>{successMessage}</small>
                  </div>
                )}

                {/* Login Form */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label small text-muted">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small text-muted">Mot de passe</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Connexion...
                        </>
                      ) : (
                        'Se connecter'
                      )}
                    </button>
                    <div className="text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0"
                        onClick={() => setMode('forgot')}
                      >
                        <small>Mot de passe oublié ?</small>
                      </button>
                    </div>
                  </form>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && (
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                      <label className="form-label small text-muted">Adresse email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Envoi...
                        </>
                      ) : (
                        'Envoyer le lien'
                      )}
                    </button>
                    <div className="text-center mt-3">
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0"
                        onClick={() => {
                          setMode('login');
                          setLocalError(null);
                        }}
                      >
                        <small>Retour à la connexion</small>
                      </button>
                    </div>
                  </form>
                )}

                {/* Success State */}
                {mode === 'success' && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setMode('login');
                        setSuccessMessage('');
                      }}
                    >
                      Retour à la connexion
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-muted small mt-4">
              © {new Date().getFullYear()} {companyName}. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
