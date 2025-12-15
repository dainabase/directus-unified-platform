/**
 * Client Portal Authentication Context
 *
 * Manages client portal authentication state:
 * - Login/Logout
 * - Token management
 * - Auto-refresh
 *
 * @date 15 Décembre 2025
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/commercial/portal';

const ClientAuthContext = createContext(null);

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('client_portal_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Verify token validity
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('client_portal_token');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('client_portal_token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('client_portal_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('client_portal_refresh', data.refreshToken);
      }

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('client_portal_token');
    localStorage.removeItem('client_portal_refresh');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Register (activate account)
  const activate = useCallback(async (token, password) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get auth header for API calls
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('client_portal_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  // Authenticated fetch wrapper
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('client_portal_token');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    // Handle token expiry
    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    return response;
  }, [logout]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    activate,
    requestPasswordReset,
    resetPassword,
    getAuthHeader,
    authFetch
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export default ClientAuthContext;
