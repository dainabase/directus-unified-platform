import React from 'react'
import { 
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  MoreVertical,
  User,
  Building
} from 'lucide-react'
import { Card, Badge, Button } from '../../../components/ui'

const TeamView = ({ people }) => {
  const getRoleColor = (role) => {
    if (role?.includes('CEO') || role?.includes('Director')) return 'primary'
    if (role?.includes('Manager') || role?.includes('Lead')) return 'info'
    if (role?.includes('Senior')) return 'success'
    return 'default'
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const avatarColors = [
    '#0071E3', '#34C759', '#5856D6', '#FF2D55',
    '#5856D6', '#FF3B30', '#FF9500', '#00C7BE'
  ]
  const getAvatarColor = (name) => {
    const index = (name?.charCodeAt(0) || 0) % avatarColors.length
    return avatarColors[index]
  }

  // Group people by company
  const peopleByCompany = people.reduce((acc, person) => {
    const company = person.employee_company || 'Non assigné'
    if (!acc[company]) {
      acc[company] = []
    }
    acc[company].push(person)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(peopleByCompany).map(([company, companyPeople]) => (
        <div key={company}>
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">{company}</h2>
            <Badge variant="default" size="sm">
              {companyPeople.length} employés
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyPeople.map((person) => (
              <Card
                key={person.id}
                hoverable
                className="p-0 overflow-hidden"
              >
                {/* Header with Avatar */}
                <div className="p-4" style={{background:'var(--accent-light)'}}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        style={{background: getAvatarColor(person.first_name)}}
                      >
                        {getInitials(person.first_name, person.last_name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {person.first_name} {person.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {person.role || 'Non défini'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Department & Status */}
                  <div className="flex gap-2">
                    {person.department && (
                      <Badge variant="default" size="sm">
                        {person.department}
                      </Badge>
                    )}
                    <Badge 
                      variant={person.status === 'active' ? 'success' : 'default'} 
                      size="sm"
                    >
                      {person.status || 'Actif'}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} />
                      <a 
                        href={`mailto:${person.email}`}
                        className="transition-colors truncate"
                        style={{color:'var(--accent)'}}
                      >
                        {person.email}
                      </a>
                    </div>
                    
                    {person.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        <span>{person.phone}</span>
                      </div>
                    )}

                    {person.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        <span>{person.location}</span>
                      </div>
                    )}

                    {person.hire_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>Depuis {new Date(person.hire_date).toLocaleDateString('fr-CH')}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {person.skills && person.skills.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {person.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.skills.length > 3 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{person.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance Indicator */}
                  {person.performance_score && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Performance</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-3 h-3 rounded-sm ${
                                  star <= person.performance_score 
                                    ? 'bg-yellow-400' 
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {person.performance_score}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Voir profil
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    Message
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TeamView