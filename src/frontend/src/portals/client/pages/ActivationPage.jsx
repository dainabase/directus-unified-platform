/**
 * Account Activation Page
 *
 * Client portal account activation:
 * - Token validation
 * - Password creation
 * - First-time setup
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const ActivationPage = ({ token, onSuccess, companyLogo, companyName = 'Espace Client' }) => {
  const { activate, isLoading, error } = useClientAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isActivated, setIsActivated] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/commercial/portal/validate-activation-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setUserEmail(data.email || '');
      } else {
        setTokenValid(false);
        setLocalError(data.error || 'Lien d\'activation invalide ou expiré');
      }
    } catch (err) {
      setTokenValid(false);
      setLocalError('Erreur de validation du lien');
    }
  };

  const validatePassword = () => {
    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setLocalError('Le mot de passe doit contenir au moins une majuscule');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setLocalError('Le mot de passe doit contenir au moins une minuscule');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setLocalError('Le mot de passe doit contenir au moins un chiffre');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!validatePassword()) {
      return;
    }

    const result = await activate(token, password);

    if (result.success) {
      setIsActivated(true);
    } else {
      setLocalError(result.error || 'Erreur lors de l\'activation');
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: 'danger', text: 'Faible' };
    if (strength <= 4) return { level: 'medium', color: 'warning', text: 'Moyen' };
    return { level: 'strong', color: 'success', text: 'Fort' };
  };

  const passwordStrength = getPasswordStrength();

  // Loading token validation
  if (tokenValid === null) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Validation...</span>
          </div>
          <p className="text-muted">Vérification du lien d'activation...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (tokenValid === false) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  <span className="display-4 text-danger mb-3 d-block">⚠️</span>
                  <h4 className="fw-bold mb-3">Lien invalide</h4>
                  <p className="text-muted mb-4">
                    {localError || 'Ce lien d\'activation est invalide ou a expiré.'}
                  </p>
                  <p className="text-muted small">
                    Veuillez contacter le support pour obtenir un nouveau lien d'activation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Activation success
  if (isActivated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  <span className="display-4 text-success mb-3 d-block">✅</span>
                  <h4 className="fw-bold mb-3">Compte activé !</h4>
                  <p className="text-muted mb-4">
                    Votre compte a été activé avec succès.
                    Vous pouvez maintenant vous connecter.
                  </p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={onSuccess}
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Activation form
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="mb-3" style={{ height: '60px' }} />
                  ) : (
                    <div className="mb-3">
                      <span className="display-6 text-primary">🔐</span>
                    </div>
                  )}
                  <h4 className="fw-bold">{companyName}</h4>
                  <p className="text-muted small">Activez votre compte</p>
                </div>

                {/* User Email */}
                {userEmail && (
                  <div className="alert alert-info py-2 mb-4">
                    <small>
                      <strong>Compte:</strong> {userEmail}
                    </small>
                  </div>
                )}

                {/* Error */}
                {(localError || error) && (
                  <div className="alert alert-danger py-2" role="alert">
                    <small>{localError || error}</small>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleActivate}>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className={`progress-bar bg-${passwordStrength.color}`}
                            style={{
                              width: `${
                                passwordStrength.level === 'weak' ? 33 :
                                passwordStrength.level === 'medium' ? 66 : 100
                              }%`
                            }}
                          />
                        </div>
                        <small className={`text-${passwordStrength.color}`}>
                          Force: {passwordStrength.text}
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label small text-muted">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className={`form-control ${
                        confirmPassword && confirmPassword !== password ? 'is-invalid' : ''
                      }`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <div className="invalid-feedback">
                        Les mots de passe ne correspondent pas
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="mb-4">
                    <small className="text-muted d-block mb-2">Le mot de passe doit contenir:</small>
                    <ul className="list-unstyled small">
                      <li className={password.length >= 8 ? 'text-success' : 'text-muted'}>
                        {password.length >= 8 ? '✓' : '○'} Au moins 8 caractères
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-success' : 'text-muted'}>
                        {/[A-Z]/.test(password) ? '✓' : '○'} Une majuscule
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-success' : 'text-muted'}>
                        {/[a-z]/.test(password) ? '✓' : '○'} Une minuscule
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-success' : 'text-muted'}>
                        {/[0-9]/.test(password) ? '✓' : '○'} Un chiffre
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading || !password || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Activation...
                      </>
                    ) : (
                      'Activer mon compte'
                    )}
                  </button>
                </form>
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

export default ActivationPage;
