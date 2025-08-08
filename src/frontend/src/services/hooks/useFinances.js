import { useQuery } from '@tanstack/react-query'
import { financesAPI } from '../api/collections/finances'

export const useCashFlow = (filters = {}) => {
  return useQuery({
    queryKey: ['cash-flow', filters],
    queryFn: () => financesAPI.getCashFlow(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const useRevenue = (filters = {}) => {
  return useQuery({
    queryKey: ['revenue', filters],
    queryFn: async () => {
      console.log('🔄 Fetching revenue with filters:', filters);
      const revenue = await financesAPI.getRevenue(filters);
      console.log('✅ Revenue fetched:', revenue);
      
      // Vérifier si les données sont réalistes
      if (revenue?.arr > 10000000) {
        console.warn('⚠️ ARR suspicieusement élevé:', revenue.arr);
      }
      if (revenue?.mrr && revenue?.arr) {
        const calculatedArr = revenue.mrr * 12;
        if (Math.abs(calculatedArr - revenue.arr) > 1000) {
          console.warn('⚠️ Incohérence ARR/MRR:', { mrr: revenue.mrr, arr: revenue.arr, calculatedArr });
        }
      }
      
      return revenue;
    },
    staleTime: 1000 * 60 * 15,
  })
}

export const useRunway = (filters = {}) => {
  return useQuery({
    queryKey: ['runway', filters],
    queryFn: async () => {
      console.log('🔄 Fetching runway with filters:', filters);
      const runway = await financesAPI.getRunway(filters);
      console.log('✅ Runway fetched:', runway);
      
      // Vérifier si les données sont réalistes
      if (runway?.runway < 0) {
        console.error('❌ Runway négatif impossible:', runway.runway);
      }
      if (runway?.balance && runway?.monthlyBurn) {
        const calculatedRunway = Math.floor(runway.balance / runway.monthlyBurn);
        console.log('📊 Runway calculé:', { 
          balance: runway.balance, 
          burn: runway.monthlyBurn, 
          calculated: calculatedRunway,
          reported: runway.runway
        });
      }
      
      return runway;
    },
    staleTime: 1000 * 60 * 60, // 1 heure
  })
}