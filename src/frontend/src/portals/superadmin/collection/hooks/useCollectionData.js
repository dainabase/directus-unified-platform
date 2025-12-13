// src/frontend/src/portals/superadmin/collection/hooks/useCollectionData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

// ============ DÉBITEURS ============

// Hook pour lister les débiteurs
export const useDebtors = (filters = {}) => {
  return useQuery({
    queryKey: ['debtors', filters],
    queryFn: () => collectionApi.getDebtors(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour un débiteur spécifique
export const useDebtor = (debtorId) => {
  return useQuery({
    queryKey: ['debtor', debtorId],
    queryFn: () => collectionApi.getDebtor(debtorId),
    enabled: !!debtorId,
  });
};

// Hook pour créer/modifier débiteur
export const useSaveDebtor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtorId, data }) => {
      return debtorId 
        ? collectionApi.updateDebtor(debtorId, data)
        : collectionApi.createDebtor(data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['debtors']);
      if (variables.debtorId) {
        queryClient.invalidateQueries(['debtor', variables.debtorId]);
      }
      toast.success(variables.debtorId ? 'Débiteur modifié' : 'Débiteur créé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour calcul âge créances
export const useAgingCalculation = (debtorId) => {
  return useQuery({
    queryKey: ['aging', debtorId],
    queryFn: () => collectionApi.calculateAging(debtorId),
    enabled: !!debtorId,
  });
};

// ============ WORKFLOW LP ============

// Hook pour étapes LP
export const useLPSteps = (debtorId) => {
  return useQuery({
    queryKey: ['lp-steps', debtorId],
    queryFn: () => collectionApi.getLPSteps(debtorId),
    enabled: !!debtorId,
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });
};

// Hook pour démarrer procédure LP
export const useStartLPProcess = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtorId, data }) => collectionApi.startLPProcess(debtorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['lp-steps', variables.debtorId]);
      queryClient.invalidateQueries(['debtor', variables.debtorId]);
      toast.success('Procédure LP démarrée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour exécuter étape LP
export const useExecuteLPStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stepId, data }) => collectionApi.executeLPStep(stepId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lp-steps']);
      toast.success('Étape LP exécutée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ INTÉRÊTS MORATOIRES ============

// Hook pour calcul intérêts
export const useInterestCalculation = (debtorId, params = {}) => {
  return useQuery({
    queryKey: ['interest', debtorId, params],
    queryFn: () => collectionApi.calculateInterest(debtorId, params),
    enabled: !!debtorId,
  });
};

// Hook pour config intérêts
export const useInterestConfig = (debtType) => {
  return useQuery({
    queryKey: ['interest-config', debtType],
    queryFn: () => collectionApi.getInterestConfig(debtType),
    enabled: !!debtType,
  });
};

// Hook pour modifier config intérêts
export const useUpdateInterestConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtType, config }) => collectionApi.updateInterestConfig(debtType, config),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['interest-config', variables.debtType]);
      toast.success('Configuration intérêts mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ DOCUMENTS ============

// Hook pour documents débiteur
export const useDebtorDocuments = (debtorId) => {
  return useQuery({
    queryKey: ['debtor-documents', debtorId],
    queryFn: () => collectionApi.getDebtorDocuments(debtorId),
    enabled: !!debtorId,
  });
};

// Hook pour générer document LP
export const useGenerateLPDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, debtorId, data }) => collectionApi.generateLPDocument(type, debtorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['debtor-documents', variables.debtorId]);
      toast.success('Document généré avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ COMMUNICATIONS ============

// Hook pour historique communications
export const useCommunicationHistory = (debtorId) => {
  return useQuery({
    queryKey: ['communication-history', debtorId],
    queryFn: () => collectionApi.getCommunicationHistory(debtorId),
    enabled: !!debtorId,
  });
};

// Hook pour envoyer communication
export const useSendCommunication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtorId, data }) => collectionApi.sendCommunication(debtorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['communication-history', variables.debtorId]);
      toast.success('Communication envoyée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour templates communications
export const useCommunicationTemplates = (type) => {
  return useQuery({
    queryKey: ['communication-templates', type],
    queryFn: () => collectionApi.getCommunicationTemplates(type),
    enabled: !!type,
  });
};

// ============ PAIEMENTS ============

// Hook pour historique paiements
export const usePaymentHistory = (debtorId) => {
  return useQuery({
    queryKey: ['payment-history', debtorId],
    queryFn: () => collectionApi.getPaymentHistory(debtorId),
    enabled: !!debtorId,
  });
};

// Hook pour enregistrer paiement
export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtorId, data }) => collectionApi.recordPayment(debtorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['payment-history', variables.debtorId]);
      queryClient.invalidateQueries(['debtor', variables.debtorId]);
      queryClient.invalidateQueries(['debtors']);
      toast.success('Paiement enregistré');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ STATISTIQUES ============

// Hook pour stats collection
export const useCollectionStats = (company, period = '30') => {
  return useQuery({
    queryKey: ['collection-stats', company, period],
    queryFn: () => collectionApi.getCollectionStats(company, period),
    enabled: !!company,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook pour analyse âge créances
export const useAgingAnalysis = (company) => {
  return useQuery({
    queryKey: ['aging-analysis', company],
    queryFn: () => collectionApi.getAgingAnalysis(company),
    enabled: !!company,
  });
};

// Hook pour performance recouvrement
export const useRecoveryPerformance = (company, period = '12') => {
  return useQuery({
    queryKey: ['recovery-performance', company, period],
    queryFn: () => collectionApi.getRecoveryPerformance(company, period),
    enabled: !!company,
  });
};

// ============ CONFIGURATION ============

// Hook pour templates lettres
export const useLetterTemplates = () => {
  return useQuery({
    queryKey: ['letter-templates'],
    queryFn: () => collectionApi.getLetterTemplates(),
  });
};

// Hook pour config canton
export const useCantonConfig = (canton) => {
  return useQuery({
    queryKey: ['canton-config', canton],
    queryFn: () => collectionApi.getCantonConfig(canton),
    enabled: !!canton,
  });
};

// Hook pour tarifs LP
export const useLPFees = (canton, debtAmount) => {
  return useQuery({
    queryKey: ['lp-fees', canton, debtAmount],
    queryFn: () => collectionApi.getLPFees(canton, debtAmount),
    enabled: !!canton && !!debtAmount,
  });
};

// ============ HOOK PRINCIPAL COMBINÉ ============

export const useCollectionData = (company, filters = {}) => {
  const debtors = useDebtors({ company, ...filters });
  const stats = useCollectionStats(company);
  const agingAnalysis = useAgingAnalysis(company);
  const recoveryPerformance = useRecoveryPerformance(company);
  
  return {
    debtors,
    stats,
    agingAnalysis,
    recoveryPerformance,
    isLoading: debtors.isLoading || stats.isLoading,
    error: debtors.error || stats.error
  };
};

export default useCollectionData;