/**
 * useFinanceData Hook
 * Gère le chargement et le rafraîchissement des données finance
 */

import { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../services/financeApi';

export function useFinanceData(company, options = {}) {
  const { autoRefresh = 60000, initialLoad = true } = options;
  
  const [data, setData] = useState({
    dashboard: null,
    kpis: null,
    alerts: [],
    evolution: [],
    upcoming: { receivables: [], payables: [] },
    transactions: [],
    reconciliations: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!company) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await financeApi.getDashboard(company);
      
      setData({
        dashboard: response.data,
        kpis: response.data.overview?.kpis || {},
        alerts: response.data.alerts || [],
        evolution: response.data.evolution || [],
        upcoming: response.data.upcoming || { receivables: [], payables: [] },
        transactions: response.data.recent_transactions || [],
        reconciliations: []
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement dashboard finance:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  const loadReconciliations = useCallback(async () => {
    if (!company) return;
    
    try {
      const response = await financeApi.getPendingReconciliations(company);
      setData(prev => ({
        ...prev,
        reconciliations: response.data || []
      }));
    } catch (err) {
      console.error('Erreur chargement rapprochements:', err);
    }
  }, [company]);

  const refresh = useCallback(() => {
    loadDashboard();
    loadReconciliations();
  }, [loadDashboard, loadReconciliations]);

  // Chargement initial
  useEffect(() => {
    if (initialLoad && company) {
      refresh();
    }
  }, [company, initialLoad, refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !company) return;
    
    const interval = setInterval(refresh, autoRefresh);
    return () => clearInterval(interval);
  }, [autoRefresh, company, refresh]);

  return {
    ...data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export default useFinanceData;