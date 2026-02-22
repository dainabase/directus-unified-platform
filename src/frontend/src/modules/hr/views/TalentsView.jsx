import React from 'react'
import { 
  Star,
  TrendingUp,
  Award,
  Target,
  Briefcase,
  GraduationCap,
  Zap
} from 'lucide-react'
import { Card, Badge, Button, Table } from '../../../components/ui'

const TalentsView = ({ people }) => {
  // Mock talents data with skills and certifications
  const talentsData = people.map(person => ({
    ...person,
    skills: person.skills || ['React', 'Node.js', 'TypeScript', 'GraphQL'].slice(0, Math.floor(Math.random() * 4) + 1),
    certifications: Math.random() > 0.5 ? ['AWS Certified', 'PMP'] : [],
    potential: Math.floor(Math.random() * 5) + 1,
    readinessForPromotion: Math.random() > 0.7,
    keyTalent: Math.random() > 0.8,
    experience: Math.floor(Math.random() * 10) + 1
  }))

  // Key talents
  const keyTalents = talentsData.filter(t => t.keyTalent)

  // Skills matrix
  const allSkills = [...new Set(talentsData.flatMap(t => t.skills))]
  const skillsCount = allSkills.reduce((acc, skill) => {
    acc[skill] = talentsData.filter(t => t.skills.includes(skill)).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Key Talents Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Talents Clés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyTalents.map((talent) => (
            <Card key={talent.id} hoverable>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {talent.first_name} {talent.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{talent.role}</p>
                </div>
                <Badge variant="warning" size="sm">
                  <Star size={12} className="mr-1" />
                  Key Talent
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Potential Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Potentiel</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-8 rounded-sm transition-all ${
                          level <= talent.potential
                            ? ''
                            : 'bg-gray-200'
                        }`}
                        style={level <= talent.potential
                          ? { height: `${level * 20}%`, background: 'linear-gradient(to top, var(--accent), var(--accent-light))' }
                          : { height: `${level * 20}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Ready for Promotion */}
                {talent.readinessForPromotion && (
                  <div className="flex items-center gap-2 text-sm" style={{color:'var(--semantic-green)'}}>
                    <TrendingUp size={14} />
                    <span>Prêt pour promotion</span>
                  </div>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {talent.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills Matrix */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Matrice des Compétences
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(skillsCount)
            .sort((a, b) => b[1] - a[1])
            .map(([skill, count]) => (
              <div
                key={skill}
                className="p-3 rounded-lg text-center transition-colors"
                style={{background:'rgba(0,0,0,0.04)'}}
              >
                <p className="font-medium text-gray-900">{skill}</p>
                <p className="text-2xl font-bold mt-1" style={{color:'var(--accent)'}}>{count}</p>
                <p className="text-xs text-gray-500">employés</p>
              </div>
            ))}
        </div>
      </Card>

      {/* Talent Pipeline */}
      <Card className="p-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pipeline de Talents
          </h2>
        </div>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Employé</Table.Header>
              <Table.Header>Rôle Actuel</Table.Header>
              <Table.Header>Expérience</Table.Header>
              <Table.Header>Compétences Clés</Table.Header>
              <Table.Header align="center">Potentiel</Table.Header>
              <Table.Header align="center">Statut</Table.Header>
              <Table.Header>Actions</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {talentsData.map((talent) => (
              <Table.Row key={talent.id}>
                <Table.Cell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {talent.first_name} {talent.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {talent.employee_company}
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={getRoleColor(talent.role)} size="sm">
                    {talent.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="text-sm">{talent.experience} ans</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="default" size="sm">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{talent.skills.length - 2}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell align="center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= talent.potential
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell align="center">
                  {talent.readinessForPromotion ? (
                    <Badge variant="success" size="sm">
                      Prêt
                    </Badge>
                  ) : talent.keyTalent ? (
                    <Badge variant="warning" size="sm">
                      À développer
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">
                      En progression
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="sm">
                    Plan de développement
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {/* Certifications Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Certifications
            </h3>
            <GraduationCap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {['AWS Certified', 'PMP', 'Scrum Master', 'Google Cloud'].map((cert) => {
              const count = talentsData.filter(t => t.certifications.includes(cert)).length
              return (
                <div key={cert} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{cert}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{ background: 'var(--accent)', width: `${(count / talentsData.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Potentiel de Croissance
            </h3>
            <Zap className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{background:'var(--tint-green)'}}>
              <span className="text-sm font-medium" style={{color:'var(--semantic-green)'}}>
                Haute Performance
              </span>
              <span className="text-lg font-bold" style={{color:'var(--semantic-green)'}}>
                {talentsData.filter(t => t.potential >= 4).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{background:'var(--accent-light)'}}>
              <span className="text-sm font-medium" style={{color:'var(--accent)'}}>
                Prêts pour promotion
              </span>
              <span className="text-lg font-bold" style={{color:'var(--accent)'}}>
                {talentsData.filter(t => t.readinessForPromotion).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{background:'var(--tint-orange)'}}>
              <span className="text-sm font-medium" style={{color:'var(--semantic-orange)'}}>
                Talents clés
              </span>
              <span className="text-lg font-bold" style={{color:'var(--semantic-orange)'}}>
                {keyTalents.length}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const getRoleColor = (role) => {
  if (role?.includes('CEO') || role?.includes('Director')) return 'primary'
  if (role?.includes('Manager') || role?.includes('Lead')) return 'info'
  if (role?.includes('Senior')) return 'success'
  return 'default'
}

export default TalentsView