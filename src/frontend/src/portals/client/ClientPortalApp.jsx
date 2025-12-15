/**
 * Client Portal App
 *
 * Main application component for client portal:
 * - Route handling
 * - Authentication flow
 * - Page rendering
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { ClientAuthProvider, useClientAuth } from './context/ClientAuthContext';
import LoginPage from './pages/LoginPage';
import ActivationPage from './pages/ActivationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ClientPortalDashboard from './pages/ClientPortalDashboard';

// URL parameter parser
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    action: params.get('action'),
    token: params.get('token')
  };
};

// Inner component that uses auth context
const ClientPortalContent = ({ companyConfig }) => {
  const { isAuthenticated, isLoading } = useClientAuth();
  const [currentView, setCurrentView] = useState('loading');
  const [actionToken, setActionToken] = useState(null);

  useEffect(() => {
    const { action, token } = getUrlParams();

    if (action === 'activate' && token) {
      setActionToken(token);
      setCurrentView('activate');
    } else if (action === 'reset' && token) {
      setActionToken(token);
      setCurrentView('reset');
    } else if (isAuthenticated) {
      setCurrentView('dashboard');
    } else if (!isLoading) {
      setCurrentView('login');
    }
  }, [isAuthenticated, isLoading]);

  // Handle successful action completion
  const handleActionComplete = () => {
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
    setCurrentView('login');
    setActionToken(null);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  // Loading state
  if (isLoading || currentView === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  // Render based on current view
  switch (currentView) {
    case 'activate':
      return (
        <ActivationPage
          token={actionToken}
          onSuccess={handleActionComplete}
          companyLogo={companyConfig?.logo}
          companyName={companyConfig?.name}
        />
      );

    case 'reset':
      return (
        <ResetPasswordPage
          token={actionToken}
          onSuccess={handleActionComplete}
          companyLogo={companyConfig?.logo}
          companyName={companyConfig?.name}
        />
      );

    case 'dashboard':
      return <ClientPortalDashboard />;

    case 'login':
    default:
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          companyLogo={companyConfig?.logo}
          companyName={companyConfig?.name}
        />
      );
  }
};

// Main App component with provider
const ClientPortalApp = ({ companyConfig = {} }) => {
  return (
    <ClientAuthProvider>
      <ClientPortalContent companyConfig={companyConfig} />
    </ClientAuthProvider>
  );
};

export default ClientPortalApp;
