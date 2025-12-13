// src/frontend/src/portals/superadmin/crm/index.js

// Module CRM - Export principal
export { default as CRMDashboard } from './CRMDashboard';

// Services
export { crmApi } from './services/crmApi';

// Hooks
export { 
  useContacts,
  useContact,
  useSaveContact,
  useDeleteContact,
  useImportContacts,
  useExportContacts,
  useSearchContacts,
  useCompanies,
  useCompany,
  useSaveCompany,
  useDeleteCompany,
  useSearchCompanies,
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useCRMStats,
  useStatsOverTime,
  useCRMData,
  useGlobalCRMSearch
} from './hooks/useCRMData';

// Composants
export { default as QuickStats } from './components/QuickStats';
export { default as ContactForm } from './components/ContactForm';
export { default as ContactsList } from './components/ContactsList';
export { default as CompanyForm } from './components/CompanyForm';
export { default as CompaniesList } from './components/CompaniesList';