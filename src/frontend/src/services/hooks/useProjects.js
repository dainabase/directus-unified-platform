import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '../api/collections/projects'

export const useProjects = (filters = {}) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      console.log('🔄 Fetching projects with filters:', filters);
      const projects = await projectsAPI.getAll(filters);
      console.log('✅ Projects fetched:', projects);
      console.log('   Total count:', projects?.length || 0);
      
      // FORCER LE RETOUR DES VRAIES DONNÉES
      if (!projects || projects.length === 0) {
        console.error('⚠️ Aucun projet trouvé !');
      } else {
        // Afficher quelques exemples
        console.log('   Exemple projet:', projects[0]);
        
        // Compter par entreprise
        const byCompany = {};
        projects.forEach(p => {
          const company = p.owner_company || 'SANS_ENTREPRISE';
          byCompany[company] = (byCompany[company] || 0) + 1;
        });
        console.log('   Répartition par entreprise:', byCompany);
      }
      
      return projects;
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useProjectStatus = () => {
  return useQuery({
    queryKey: ['project-status'],
    queryFn: projectsAPI.getByStatus,
    staleTime: 1000 * 60 * 5,
  })
}

export const useProjectTimeline = (limit = 10) => {
  return useQuery({
    queryKey: ['project-timeline', limit],
    queryFn: () => projectsAPI.getTimeline(limit),
    staleTime: 1000 * 60 * 5,
  })
}