// src/frontend/src/portals/superadmin/collection/index.js

// Module Collection - Export principal
export { default as CollectionDashboard } from './CollectionDashboard';

// Services
export { collectionApi } from './services/collectionApi';

// Hooks
export { 
  useCollectionData,
  useDebtors,
  useDebtor,
  useSaveDebtor,
  useAgingCalculation,
  useLPSteps,
  useStartLPProcess,
  useExecuteLPStep,
  useInterestCalculation,
  useInterestConfig,
  useUpdateInterestConfig,
  useDebtorDocuments,
  useGenerateLPDocument,
  useCommunicationHistory,
  useSendCommunication,
  useCommunicationTemplates,
  usePaymentHistory,
  useRecordPayment,
  useCollectionStats,
  useAgingAnalysis,
  useRecoveryPerformance,
  useLetterTemplates,
  useCantonConfig,
  useLPFees
} from './hooks/useCollectionData';

// Composants
export { default as DebtorsList } from './components/DebtorsList';
export { default as CollectionStats } from './components/CollectionStats';
export { default as InterestCalculator } from './components/InterestCalculator';

// Note: Les composants suivants sont en cours de développement
// export { default as DebtorDetail } from './components/DebtorDetail';
// export { default as WorkflowTimeline } from './components/WorkflowTimeline';
// export { default as LPCases } from './components/LPCases';
// export { default as WorkflowConfig } from './components/WorkflowConfig';
// export { default as AgingChart } from './components/AgingChart';