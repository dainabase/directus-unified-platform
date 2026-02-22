import React, { useState } from 'react'
import { 
  Users,
  UserPlus,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  Download,
  Mail
} from 'lucide-react'
import { Button, Input, Select, Badge, Card } from '../../components/ui'
import TeamView from './views/TeamView'
import TalentsView from './views/TalentsView'
import PerformanceView from './views/PerformanceView'
import RecruitmentView from './views/RecruitmentView'
import TrainingsView from './views/TrainingsView'
import { usePeople } from '../../services/hooks/usePeople'

const HRModule = ({ selectedCompany }) => {
  const [currentView, setCurrentView] = useState('team')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterRole, setFilterRole] = useState('all')

  // Fetch people data
  const { data: people, isLoading } = usePeople({ 
    company: selectedCompany === 'all' ? undefined : selectedCompany,
    isEmployee: true
  })

  // View tabs
  const viewTabs = [
    { id: 'team', label: 'Équipe', icon: <Users size={18} /> },
    { id: 'talents', label: 'Talents', icon: <Award size={18} /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp size={18} /> },
    { id: 'recruitment', label: 'Recrutement', icon: <UserPlus size={18} /> },
    { id: 'trainings', label: 'Formations', icon: <Calendar size={18} /> }
  ]

  // Filter people
  const filteredPeople = people?.filter(person => {
    const matchesSearch = person.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || person.department === filterDepartment
    const matchesRole = filterRole === 'all' || person.role === filterRole
    
    return matchesSearch && matchesDepartment && matchesRole
  }) || []

  // Stats
  const stats = {
    totalEmployees: filteredPeople.length,
    activeEmployees: filteredPeople.filter(p => p.status === 'active').length,
    departments: [...new Set(people?.map(p => p.department).filter(Boolean))].length,
    averageTenure: '2.3 ans', // Mock data
    turnoverRate: '12%' // Mock data
  }

  // Department distribution
  const departmentDistribution = people?.reduce((acc, person) => {
    const dept = person.department || 'Non assigné'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RH & Talents</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos équipes et talents
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Mail size={18} />}>
            Inviter
          </Button>
          <Button variant="primary" leftIcon={<UserPlus size={18} />}>
            Nouveau Collaborateur
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8" style={{color:'var(--accent)'}} />
            <Badge variant="primary" size="sm">Total</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
          <p className="text-sm text-gray-600">Employés</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8" style={{color:'var(--semantic-green)'}} />
            <Badge variant="success" size="sm">Actifs</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
          <p className="text-sm text-gray-600">Collaborateurs actifs</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Départements</p>
          <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
          <div className="mt-2 flex gap-1">
            {Object.keys(departmentDistribution || {}).slice(0, 3).map(dept => (
              <Badge key={dept} variant="default" size="sm">
                {dept}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Ancienneté moy.</p>
          <p className="text-2xl font-bold text-gray-900">{stats.averageTenure}</p>
          <p className="text-xs mt-1" style={{color:'var(--semantic-green)'}}>↑ 15% vs année dernière</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Turnover</p>
          <p className="text-2xl font-bold text-gray-900">{stats.turnoverRate}</p>
          <p className="text-xs mt-1" style={{color:'var(--semantic-red)'}}>↑ 3% vs Q1</p>
        </Card>
      </div>

      {/* View Tabs */}
      <Card className="p-1">
        <div className="flex">
          {viewTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2
                px-4 py-3 rounded-md transition-all duration-200
                ${currentView === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-700'}
              `}
              style={currentView === tab.id ? {background:'var(--accent)'} : {}}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            type="search"
            placeholder="Rechercher un collaborateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            className="lg:w-96"
          />

          <Select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les départements' },
              ...Object.keys(departmentDistribution || {}).map(dept => ({
                value: dept,
                label: `${dept} (${departmentDistribution[dept]})`
              }))
            ]}
            className="w-64"
          />

          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les rôles' },
              { value: 'CEO', label: 'CEO' },
              { value: 'CTO', label: 'CTO' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Developer', label: 'Développeur' },
              { value: 'Designer', label: 'Designer' }
            ]}
            className="w-48"
          />

          <div className="flex-1" />

          <Button variant="secondary" leftIcon={<Download size={18} />}>
            Exporter
          </Button>
        </div>
      </Card>

      {/* Content View */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor:'var(--accent)'}}></div>
          </div>
        ) : (
          <>
            {currentView === 'team' && <TeamView people={filteredPeople} />}
            {currentView === 'talents' && <TalentsView people={filteredPeople} />}
            {currentView === 'performance' && <PerformanceView people={filteredPeople} />}
            {currentView === 'recruitment' && <RecruitmentView selectedCompany={selectedCompany} />}
            {currentView === 'trainings' && <TrainingsView selectedCompany={selectedCompany} />}
          </>
        )}
      </div>
    </div>
  )
}

export default HRModule