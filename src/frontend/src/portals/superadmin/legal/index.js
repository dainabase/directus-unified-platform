// src/frontend/src/portals/superadmin/legal/index.js

// Module Legal - Export principal
export { default as LegalDashboard } from './LegalDashboard';

// Services
export { legalApi } from './services/legalApi';

// Hooks
export { 
  useLegalData,
  useCGV, 
  useCGVList,
  useSaveCGV,
  useActivateCGV,
  useSignatureRequests,
  useCreateSignature,
  useAcceptanceHistory,
  useLegalStats
} from './hooks/useLegalData';

// Composants
export { default as CGVManager } from './components/CGVManager';
export { default as CGVEditor } from './components/CGVEditor';
export { default as CGVPreview } from './components/CGVPreview';
export { default as SignatureRequests } from './components/SignatureRequests';
export { default as AcceptanceHistory } from './components/AcceptanceHistory';
export { default as LegalStats } from './components/LegalStats';