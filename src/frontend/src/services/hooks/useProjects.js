import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '../api/collections/projects'

export const useProjects = (filters = {}) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsAPI.getAll(filters),
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