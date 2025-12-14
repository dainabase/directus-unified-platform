// src/frontend/src/portals/superadmin/settings/hooks/useSettingsData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settingsApi';
import toast from 'react-hot-toast';

// ============ OUR COMPANIES ============

export const useOurCompanies = () => {
  return useQuery({
    queryKey: ['our-companies'],
    queryFn: () => settingsApi.getOurCompanies(),
    staleTime: 300000,
  });
};

export const useOurCompany = (id) => {
  return useQuery({
    queryKey: ['our-company', id],
    queryFn: () => settingsApi.getOurCompany(id),
    enabled: !!id,
  });
};

export const useUpdateOurCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateOurCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['our-companies']);
      queryClient.invalidateQueries(['our-company', variables.id]);
      toast.success('Entreprise mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ INVOICE SETTINGS ============

export const useInvoiceSettings = (companyId) => {
  return useQuery({
    queryKey: ['invoice-settings', companyId],
    queryFn: () => settingsApi.getInvoiceSettings(companyId),
    enabled: !!companyId,
  });
};

export const useUpdateInvoiceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateInvoiceSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoice-settings']);
      toast.success('Paramètres de facturation mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useCreateInvoiceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => settingsApi.createInvoiceSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoice-settings']);
      toast.success('Paramètres de facturation créés');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ TAX RATES ============

export const useTaxRates = () => {
  return useQuery({
    queryKey: ['tax-rates'],
    queryFn: () => settingsApi.getTaxRates(),
    staleTime: 600000,
  });
};

export const useUpdateTaxRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateTaxRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-rates']);
      toast.success('Taux TVA mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ PRODUCTS ============

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => settingsApi.getProducts(params),
    staleTime: 60000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => settingsApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => settingsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit créé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', variables.id]);
      toast.success('Produit mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => settingsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ USERS ============

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => settingsApi.getUsers(),
    staleTime: 120000,
  });
};

// ============ COMBINED HOOK ============

export const useSettingsData = (companyId) => {
  const ourCompanies = useOurCompanies();
  const invoiceSettings = useInvoiceSettings(companyId);
  const taxRates = useTaxRates();
  const products = useProducts();

  return {
    ourCompanies,
    invoiceSettings,
    taxRates,
    products,
    isLoading: ourCompanies.isLoading || invoiceSettings.isLoading,
    error: ourCompanies.error || invoiceSettings.error
  };
};

export default useSettingsData;
