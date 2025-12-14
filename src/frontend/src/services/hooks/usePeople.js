import { useState, useEffect } from 'react'

// Mock data for demo
const mockPeople = [
  { id: 1, name: 'Marie Dupont', role: 'Lead Developer', department: 'Tech', status: 'Active', email: 'marie.dupont@company.com' },
  { id: 2, name: 'Pierre Martin', role: 'Designer UI/UX', department: 'Design', status: 'Active', email: 'pierre.martin@company.com' },
  { id: 3, name: 'Sophie Bernard', role: 'Project Manager', department: 'Management', status: 'Active', email: 'sophie.bernard@company.com' },
  { id: 4, name: 'Lucas Petit', role: 'Full Stack Dev', department: 'Tech', status: 'On Leave', email: 'lucas.petit@company.com' },
  { id: 5, name: 'Emma Wilson', role: 'HR Manager', department: 'HR', status: 'Active', email: 'emma.wilson@company.com' },
  { id: 6, name: 'Thomas Garcia', role: 'DevOps Engineer', department: 'Tech', status: 'Active', email: 'thomas.garcia@company.com' }
]

export function usePeople(filters = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        let filteredPeople = [...mockPeople]
        
        // Apply filters
        if (filters.department) {
          filteredPeople = filteredPeople.filter(p => p.department === filters.department)
        }
        if (filters.status) {
          filteredPeople = filteredPeople.filter(p => p.status === filters.status)
        }
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filteredPeople = filteredPeople.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.role.toLowerCase().includes(search) ||
            p.email.toLowerCase().includes(search)
          )
        }
        
        setData(filteredPeople)
        setError(null)
      } catch (err) {
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPeople()
  }, [filters.department, filters.status, filters.search])

  return { data, loading, error }
}