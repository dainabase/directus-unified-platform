// src/frontend/src/portals/superadmin/crm/hooks/useCRMData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { crmApi } from '../services/crmApi';

// ============ CONTACTS HOOKS ============

export const useContacts = (params = {}) => {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => crmApi.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useContact = (id, enabled = true) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => crmApi.getContact(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

export const useSaveContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      return id ? crmApi.updateContact(id, data) : crmApi.createContact(data);
    },
    onSuccess: (data, variables) => {
      const action = variables.id ? 'modifié' : 'créé';
      toast.success(`Contact ${action} avec succès`);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Erreur sauvegarde contact:', error);
      toast.error('Erreur lors de la sauvegarde du contact');
    }
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteContact(id),
    onSuccess: () => {
      toast.success('Contact supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    },
    onError: (error) => {
      console.error('Erreur suppression contact:', error);
      toast.error('Erreur lors de la suppression du contact');
    }
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, mapping }) => crmApi.importContacts(file, mapping),
    onSuccess: (data) => {
      toast.success(`${data.imported || 0} contacts importés avec succès`);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    },
    onError: (error) => {
      console.error('Erreur import contacts:', error);
      toast.error('Erreur lors de l\'importation des contacts');
    }
  });
};

export const useExportContacts = () => {
  return useMutation({
    mutationFn: (filters) => crmApi.exportContacts(filters),
    onSuccess: (blob, variables) => {
      // Télécharger le fichier CSV
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export terminé avec succès');
    },
    onError: (error) => {
      console.error('Erreur export contacts:', error);
      toast.error('Erreur lors de l\'export des contacts');
    }
  });
};

export const useSearchContacts = (query, enabled = true) => {
  return useQuery({
    queryKey: ['search-contacts', query],
    queryFn: () => crmApi.searchContacts(query),
    enabled: enabled && query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};

// ============ COMPANIES HOOKS ============

export const useCompanies = (params = {}) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => crmApi.getCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useCompany = (id, enabled = true) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => crmApi.getCompany(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

export const useSaveCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      return id ? crmApi.updateCompany(id, data) : crmApi.createCompany(data);
    },
    onSuccess: (data, variables) => {
      const action = variables.id ? 'modifiée' : 'créée';
      toast.success(`Entreprise ${action} avec succès`);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
      }
    },
    onError: (error) => {
      console.error('Erreur sauvegarde entreprise:', error);
      toast.error('Erreur lors de la sauvegarde de l\'entreprise');
    }
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteCompany(id),
    onSuccess: () => {
      toast.success('Entreprise supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    },
    onError: (error) => {
      console.error('Erreur suppression entreprise:', error);
      toast.error('Erreur lors de la suppression de l\'entreprise');
    }
  });
};

export const useSearchCompanies = (query, enabled = true) => {
  return useQuery({
    queryKey: ['search-companies', query],
    queryFn: () => crmApi.searchCompanies(query),
    enabled: enabled && query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};

// ============ ACTIVITIES HOOKS ============

export const useActivities = (params = {}) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => crmApi.getActivities(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000 // Auto-refresh toutes les 5 minutes
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityData) => crmApi.createActivity(activityData),
    onSuccess: () => {
      toast.success('Activité enregistrée avec succès');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    },
    onError: (error) => {
      console.error('Erreur création activité:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'activité');
    }
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateActivity(id, data),
    onSuccess: () => {
      toast.success('Activité modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (error) => {
      console.error('Erreur modification activité:', error);
      toast.error('Erreur lors de la modification de l\'activité');
    }
  });
};

// ============ STATISTICS HOOKS ============

export const useCRMStats = (company = null) => {
  return useQuery({
    queryKey: ['crm-stats', company],
    queryFn: () => crmApi.getCRMStats(company),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 10 * 60 * 1000 // Auto-refresh toutes les 10 minutes
  });
};

export const useStatsOverTime = (period = '30', company = null) => {
  return useQuery({
    queryKey: ['stats-over-time', period, company],
    queryFn: () => crmApi.getStatsOverTime(period, company),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

// ============ COMBINED HOOKS ============

// Hook pour les données complètes d'un dashboard
export const useCRMData = (company = null) => {
  const stats = useCRMStats(company);
  const recentActivities = useActivities({ 
    limit: 10, 
    company: company 
  });
  const recentContacts = useContacts({ 
    limit: 5, 
    company: company,
    sort: '-date_created'
  });
  const recentCompanies = useCompanies({ 
    limit: 5, 
    company: company,
    sort: '-date_created'
  });
  
  return {
    stats,
    recentActivities,
    recentContacts,
    recentCompanies,
    isLoading: stats.isLoading || recentActivities.isLoading || 
               recentContacts.isLoading || recentCompanies.isLoading,
    error: stats.error || recentActivities.error || 
           recentContacts.error || recentCompanies.error
  };
};

// Hook pour la recherche globale
export const useGlobalCRMSearch = (query, enabled = true) => {
  const contactsSearch = useSearchContacts(query, enabled);
  const companiesSearch = useSearchCompanies(query, enabled);
  
  return {
    contacts: contactsSearch.data || [],
    companies: companiesSearch.data || [],
    isLoading: contactsSearch.isLoading || companiesSearch.isLoading,
    error: contactsSearch.error || companiesSearch.error
  };
};