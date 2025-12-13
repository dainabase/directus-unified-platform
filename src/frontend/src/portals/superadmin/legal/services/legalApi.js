// src/frontend/src/portals/superadmin/legal/services/legalApi.js
import axios from 'axios';

const API_BASE = '/api/legal';

export const legalApi = {
  // ============ CGV/CGL ============
  
  // Récupérer CGV par entreprise et type
  getCGV: async (company, type) => {
    const response = await axios.get(`${API_BASE}/cgv/${company}/${type}`);
    return response.data;
  },
  
  // Créer/Mettre à jour CGV
  saveCGV: async (company, type, data) => {
    const response = await axios.post(`${API_BASE}/cgv/${company}/${type}`, data);
    return response.data;
  },
  
  // Lister toutes les CGV d'une entreprise
  listCGV: async (company) => {
    const response = await axios.get(`${API_BASE}/cgv/${company}`);
    return response.data;
  },
  
  // Activer une version de CGV
  activateCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/activate`);
    return response.data;
  },
  
  // Archiver une CGV
  archiveCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/archive`);
    return response.data;
  },
  
  // Prévisualiser CGV avec variables
  previewCGV: async (cgvId, variables) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/preview`, { variables });
    return response.data;
  },
  
  // ============ ACCEPTATIONS ============
  
  // Enregistrer acceptation client
  recordAcceptance: async (cgvId, clientData) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/accept`, clientData);
    return response.data;
  },
  
  // Historique acceptations
  getAcceptanceHistory: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/acceptances`, { params: filters });
    return response.data;
  },
  
  // Vérifier acceptation client
  verifyAcceptance: async (clientId, cgvType) => {
    const response = await axios.get(`${API_BASE}/acceptances/verify/${clientId}/${cgvType}`);
    return response.data;
  },
  
  // ============ SIGNATURES ============
  
  // Créer demande de signature
  createSignatureRequest: async (data) => {
    const response = await axios.post(`${API_BASE}/signature/request`, data);
    return response.data;
  },
  
  // Lister demandes de signature
  listSignatureRequests: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/signature/requests`, { params: filters });
    return response.data;
  },
  
  // Statut demande signature
  getSignatureStatus: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signature/${requestId}`);
    return response.data;
  },
  
  // Vérifier validité signature
  verifySignature: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signature/${requestId}/verify`);
    return response.data;
  },
  
  // Annuler demande signature
  cancelSignatureRequest: async (requestId, reason) => {
    const response = await axios.post(`${API_BASE}/signature/${requestId}/cancel`, { reason });
    return response.data;
  },
  
  // Renvoyer demande signature
  resendSignatureRequest: async (requestId) => {
    const response = await axios.post(`${API_BASE}/signature/${requestId}/resend`);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats légales globales
  getLegalStats: async (company) => {
    const response = await axios.get(`${API_BASE}/stats/${company}`);
    return response.data;
  }
};

export default legalApi;