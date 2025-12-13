// src/frontend/src/portals/superadmin/collection/services/collectionApi.js
import axios from 'axios';

const API_BASE = '/api/collection';

export const collectionApi = {
  // ============ DÉBITEURS ============
  
  // Lister débiteurs avec filtres
  getDebtors: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/debtors`, { params: filters });
    return response.data;
  },
  
  // Détails débiteur
  getDebtor: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/debtors/${debtorId}`);
    return response.data;
  },
  
  // Créer nouveau débiteur
  createDebtor: async (data) => {
    const response = await axios.post(`${API_BASE}/debtors`, data);
    return response.data;
  },
  
  // Mettre à jour débiteur
  updateDebtor: async (debtorId, data) => {
    const response = await axios.put(`${API_BASE}/debtors/${debtorId}`, data);
    return response.data;
  },
  
  // Calculer âge des créances
  calculateAging: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/debtors/${debtorId}/aging`);
    return response.data;
  },
  
  // ============ WORKFLOW LP ============
  
  // Démarrer procédure LP
  startLPProcess: async (debtorId, data) => {
    const response = await axios.post(`${API_BASE}/lp/${debtorId}/start`, data);
    return response.data;
  },
  
  // Étapes workflow LP
  getLPSteps: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/lp/${debtorId}/steps`);
    return response.data;
  },
  
  // Exécuter étape LP
  executeLPStep: async (stepId, data) => {
    const response = await axios.post(`${API_BASE}/lp/steps/${stepId}/execute`, data);
    return response.data;
  },
  
  // Générer commandement de payer
  generatePaymentOrder: async (debtorId, data) => {
    const response = await axios.post(`${API_BASE}/lp/${debtorId}/payment-order`, data);
    return response.data;
  },
  
  // Générer réquisition de poursuite
  generatePursuitOrder: async (debtorId, data) => {
    const response = await axios.post(`${API_BASE}/lp/${debtorId}/pursuit-order`, data);
    return response.data;
  },
  
  // ============ INTÉRÊTS MORATOIRES ============
  
  // Calculer intérêts
  calculateInterest: async (debtorId, params = {}) => {
    const response = await axios.get(`${API_BASE}/interest/${debtorId}`, { params });
    return response.data;
  },
  
  // Configuration intérêts par type
  getInterestConfig: async (debtType) => {
    const response = await axios.get(`${API_BASE}/interest/config/${debtType}`);
    return response.data;
  },
  
  // Mettre à jour config intérêts
  updateInterestConfig: async (debtType, config) => {
    const response = await axios.put(`${API_BASE}/interest/config/${debtType}`, config);
    return response.data;
  },
  
  // ============ DOCUMENTS LP ============
  
  // Générer document LP (commandement, réquisition, etc.)
  generateLPDocument: async (type, debtorId, data) => {
    const response = await axios.post(`${API_BASE}/documents/${type}/${debtorId}`, data);
    return response.data;
  },
  
  // Télécharger document généré
  downloadDocument: async (documentId) => {
    const response = await axios.get(`${API_BASE}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Lister documents débiteur
  getDebtorDocuments: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/debtors/${debtorId}/documents`);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats collection globales
  getCollectionStats: async (company, period = '30') => {
    const response = await axios.get(`${API_BASE}/stats/${company}`, { 
      params: { period }
    });
    return response.data;
  },
  
  // Analyse âge des créances
  getAgingAnalysis: async (company) => {
    const response = await axios.get(`${API_BASE}/aging-analysis/${company}`);
    return response.data;
  },
  
  // Performance recouvrement
  getRecoveryPerformance: async (company, period = '12') => {
    const response = await axios.get(`${API_BASE}/recovery-performance/${company}`, {
      params: { period }
    });
    return response.data;
  },
  
  // ============ TEMPLATES & CONFIGURATION ============
  
  // Templates de lettres LP
  getLetterTemplates: async () => {
    const response = await axios.get(`${API_BASE}/templates/letters`);
    return response.data;
  },
  
  // Créer/modifier template
  saveLetterTemplate: async (templateId, data) => {
    const url = templateId 
      ? `${API_BASE}/templates/letters/${templateId}`
      : `${API_BASE}/templates/letters`;
    const method = templateId ? 'put' : 'post';
    const response = await axios[method](url, data);
    return response.data;
  },
  
  // Configuration workflow par canton
  getCantonConfig: async (canton) => {
    const response = await axios.get(`${API_BASE}/config/canton/${canton}`);
    return response.data;
  },
  
  // Tarifs LP par canton
  getLPFees: async (canton, debtAmount) => {
    const response = await axios.get(`${API_BASE}/config/lp-fees/${canton}`, {
      params: { amount: debtAmount }
    });
    return response.data;
  },
  
  // ============ COMMUNICATIONS ============
  
  // Envoyer lettre/email
  sendCommunication: async (debtorId, data) => {
    const response = await axios.post(`${API_BASE}/communications/${debtorId}/send`, data);
    return response.data;
  },
  
  // Historique communications
  getCommunicationHistory: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/communications/${debtorId}`);
    return response.data;
  },
  
  // Modèles de communication
  getCommunicationTemplates: async (type) => {
    const response = await axios.get(`${API_BASE}/communications/templates`, {
      params: { type }
    });
    return response.data;
  },
  
  // ============ PAIEMENTS ============
  
  // Enregistrer paiement
  recordPayment: async (debtorId, data) => {
    const response = await axios.post(`${API_BASE}/payments/${debtorId}`, data);
    return response.data;
  },
  
  // Historique paiements
  getPaymentHistory: async (debtorId) => {
    const response = await axios.get(`${API_BASE}/payments/${debtorId}`);
    return response.data;
  },
  
  // Valider paiement bancaire
  validateBankPayment: async (paymentId) => {
    const response = await axios.post(`${API_BASE}/payments/${paymentId}/validate`);
    return response.data;
  },
  
  // ============ EXPORT & RAPPORTS ============
  
  // Export liste débiteurs
  exportDebtors: async (filters, format = 'xlsx') => {
    const response = await axios.get(`${API_BASE}/export/debtors`, {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Rapport mensuel collection
  getMonthlyReport: async (company, year, month) => {
    const response = await axios.get(`${API_BASE}/reports/${company}/${year}/${month}`);
    return response.data;
  },
  
  // Générer rapport personnalisé
  generateCustomReport: async (company, config) => {
    const response = await axios.post(`${API_BASE}/reports/${company}/custom`, config);
    return response.data;
  }
};

export default collectionApi;