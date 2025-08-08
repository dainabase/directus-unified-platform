import { useQuery } from '@tanstack/react-query'
import { financesAPI } from '../api/collections/finances'

export const useCashFlow = (year) => {
  return useQuery({
    queryKey: ['cash-flow', year],
    queryFn: () => financesAPI.getCashFlow(year),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export const useRevenue = () => {
  return useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      console.log('🔄 Fetching revenue...');
      const revenue = await financesAPI.getRevenue();
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

export const useRunway = () => {
  return useQuery({
    queryKey: ['runway'],
    queryFn: async () => {
      console.log('🔄 Fetching runway...');
      const runway = await financesAPI.getRunway();
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