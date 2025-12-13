// src/frontend/src/portals/superadmin/legal/hooks/useLegalData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

// Hook pour les CGV
export const useCGV = (company, type) => {
  return useQuery({
    queryKey: ['cgv', company, type],
    queryFn: () => legalApi.getCGV(company, type),
    enabled: !!company && !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour lister toutes les CGV
export const useCGVList = (company) => {
  return useQuery({
    queryKey: ['cgv-list', company],
    queryFn: () => legalApi.listCGV(company),
    enabled: !!company,
  });
};

// Hook pour sauvegarder CGV
export const useSaveCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ company, type, data }) => legalApi.saveCGV(company, type, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['cgv', variables.company]);
      queryClient.invalidateQueries(['cgv-list', variables.company]);
      toast.success('CGV sauvegardée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour activer CGV
export const useActivateCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cgvId) => legalApi.activateCGV(cgvId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cgv']);
      queryClient.invalidateQueries(['cgv-list']);
      toast.success('CGV activée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour les demandes de signature
export const useSignatureRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['signature-requests', filters],
    queryFn: () => legalApi.listSignatureRequests(filters),
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });
};

// Hook pour créer demande signature
export const useCreateSignature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => legalApi.createSignatureRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['signature-requests']);
      toast.success('Demande de signature envoyée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour historique acceptations
export const useAcceptanceHistory = (filters = {}) => {
  return useQuery({
    queryKey: ['acceptances', filters],
    queryFn: () => legalApi.getAcceptanceHistory(filters),
  });
};

// Hook pour stats légales
export const useLegalStats = (company) => {
  return useQuery({
    queryKey: ['legal-stats', company],
    queryFn: () => legalApi.getLegalStats(company),
    enabled: !!company,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook principal combiné
export const useLegalData = (company) => {
  const cgvList = useCGVList(company);
  const signatureRequests = useSignatureRequests({ company });
  const acceptances = useAcceptanceHistory({ company, limit: 50 });
  const stats = useLegalStats(company);
  
  return {
    cgvList,
    signatureRequests,
    acceptances,
    stats,
    isLoading: cgvList.isLoading || signatureRequests.isLoading,
    error: cgvList.error || signatureRequests.error
  };
};

export default useLegalData;