// src/frontend/src/modules/hr/views/TrainingsView.jsx
import React, { useState } from 'react';
import {
  GraduationCap, Plus, Search, Filter, Calendar, Users, Clock,
  Star, Award, CheckCircle, Play, BookOpen, Video, FileText,
  TrendingUp, Target, Edit2, Trash2, Eye, Download, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockCourses = [
  {
    id: 1,
    title: 'Management & Leadership',
    category: 'management',
    type: 'video',
    duration: 8,
    level: 'intermediate',
    enrolled: 24,
    completed: 18,
    rating: 4.7,
    mandatory: false,
    instructor: 'Dr. Sophie Martin'
  },
  {
    id: 2,
    title: 'Securite Informatique - Fondamentaux',
    category: 'security',
    type: 'interactive',
    duration: 4,
    level: 'beginner',
    enrolled: 45,
    completed: 42,
    rating: 4.5,
    mandatory: true,
    instructor: 'Jean Dupont'
  },
  {
    id: 3,
    title: 'Communication Client',
    category: 'soft-skills',
    type: 'workshop',
    duration: 6,
    level: 'beginner',
    enrolled: 15,
    completed: 8,
    rating: 4.8,
    mandatory: false,
    instructor: 'Marie Blanc'
  },
  {
    id: 4,
    title: 'RGPD et Protection des Donnees',
    category: 'compliance',
    type: 'video',
    duration: 2,
    level: 'beginner',
    enrolled: 52,
    completed: 50,
    rating: 4.2,
    mandatory: true,
    instructor: 'Thomas Weber'
  },
  {
    id: 5,
    title: 'Developpement Agile & Scrum',
    category: 'technical',
    type: 'interactive',
    duration: 12,
    level: 'advanced',
    enrolled: 18,
    completed: 12,
    rating: 4.9,
    mandatory: false,
    instructor: 'Lucas Meyer'
  },
  {
    id: 6,
    title: 'Excel Avance',
    category: 'technical',
    type: 'video',
    duration: 5,
    level: 'intermediate',
    enrolled: 28,
    completed: 20,
    rating: 4.4,
    mandatory: false,
    instructor: 'Anna Schmidt'
  }
];

const mockEmployeeProgress = [
  { name: 'Marie Martin', courses: 5, completed: 4, hours: 22 },
  { name: 'Jean Dupont', courses: 4, completed: 4, hours: 18 },
  { name: 'Sophie Blanc', courses: 6, completed: 3, hours: 15 },
  { name: 'Thomas Weber', courses: 3, completed: 3, hours: 12 },
  { name: 'Lucas Meyer', courses: 5, completed: 2, hours: 10 }
];

const mockMonthlyStats = [
  { month: 'Jul', completions: 12, enrollments: 18 },
  { month: 'Aou', completions: 8, enrollments: 15 },
  { month: 'Sep', completions: 15, enrollments: 22 },
  { month: 'Oct', completions: 20, enrollments: 28 },
  { month: 'Nov', completions: 18, enrollments: 25 },
  { month: 'Dec', completions: 22, enrollments: 30 }
];

const mockCategoryDistribution = [
  { name: 'Technique', value: 35, color: '#3b82f6' },
  { name: 'Compliance', value: 25, color: '#10b981' },
  { name: 'Soft Skills', value: 20, color: '#f59e0b' },
  { name: 'Management', value: 12, color: '#8b5cf6' },
  { name: 'Securite', value: 8, color: '#ef4444' }
];

const CATEGORIES = {
  technical: { label: 'Technique', color: 'primary' },
  compliance: { label: 'Compliance', color: 'success' },
  'soft-skills': { label: 'Soft Skills', color: 'warning' },
  management: { label: 'Management', color: 'purple' },
  security: { label: 'Securite', color: 'danger' }
};

const LEVELS = {
  beginner: { label: 'Debutant', color: 'success' },
  intermediate: { label: 'Intermediaire', color: 'warning' },
  advanced: { label: 'Avance', color: 'danger' }
};

const TYPE_ICONS = {
  video: Video,
  interactive: Play,
  workshop: Users,
  document: FileText
};

const TrainingsView = ({ selectedCompany }) => {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || c.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCategoryBadge = (category) => {
    const config = CATEGORIES[category];
    return (
      <span className={`badge bg-${config?.color || 'secondary'}-lt text-${config?.color || 'secondary'}`}>
        {config?.label || category}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const config = LEVELS[level];
    return (
      <span className={`badge bg-${config?.color || 'secondary'}`}>
        {config?.label || level}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const Icon = TYPE_ICONS[type] || BookOpen;
    return <Icon size={16} />;
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={12}
            className={star <= Math.round(rating) ? 'text-warning' : 'text-muted'}
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
        <small className="ms-1 text-muted">{rating}</small>
      </div>
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette formation?')) {
      setCourses(courses.filter(c => c.id !== id));
      toast.success('Formation supprimee');
    }
  };

  // Stats
  const stats = {
    totalCourses: courses.length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.enrolled, 0),
    totalCompletions: courses.reduce((sum, c) => sum + c.completed, 0),
    avgRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1),
    totalHours: courses.reduce((sum, c) => sum + c.duration, 0),
    mandatoryCourses: courses.filter(c => c.mandatory).length
  };

  const completionRate = Math.round((stats.totalCompletions / stats.totalEnrollments) * 100);

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <GraduationCap className="me-2" size={24} />
              Formations
            </h2>
            <div className="text-muted mt-1">
              Catalogue et suivi des formations
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <Download size={16} className="me-1" />
              Rapport
            </button>
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={16} className="me-1" />
              Nouvelle formation
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <BookOpen size={20} className="text-primary me-2" />
                <span className="text-muted small">Formations</span>
              </div>
              <h3 className="mb-0">{stats.totalCourses}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Users size={20} className="text-info me-2" />
                <span className="text-muted small">Inscriptions</span>
              </div>
              <h3 className="mb-0">{stats.totalEnrollments}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Completees</span>
              </div>
              <h3 className="mb-0">{stats.totalCompletions}</h3>
              <small className="text-muted">{completionRate}% taux</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-warning me-2" />
                <span className="text-muted small">Heures totales</span>
              </div>
              <h3 className="mb-0">{stats.totalHours}h</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Star size={20} className="text-warning me-2" />
                <span className="text-muted small">Note moyenne</span>
              </div>
              <h3 className="mb-0">{stats.avgRating}/5</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Award size={20} className="text-danger me-2" />
                <span className="text-muted small">Obligatoires</span>
              </div>
              <h3 className="mb-0">{stats.mandatoryCourses}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('courses'); }}
          >
            <BookOpen size={16} className="me-2" />
            Catalogue
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('progress'); }}
          >
            <TrendingUp size={16} className="me-2" />
            Progression
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}
          >
            <BarChart3 size={16} className="me-2" />
            Analytics
          </a>
        </li>
      </ul>

      {activeTab === 'courses' && (
        <>
          {/* Search & Filters */}
          <div className="d-flex gap-2 mb-4">
            <div className="input-group" style={{ width: 300 }}>
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Toutes categories</option>
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Tous niveaux</option>
              {Object.entries(LEVELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Courses Grid */}
          <div className="row g-4">
            {filteredCourses.map(course => (
              <div key={course.id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-1">{course.title}</h5>
                        <small className="text-muted">{course.instructor}</small>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        {getTypeIcon(course.type)}
                        {course.mandatory && (
                          <span className="badge bg-danger-lt text-danger ms-1">Obligatoire</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {getCategoryBadge(course.category)}
                      {getLevelBadge(course.level)}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center text-muted small">
                        <Clock size={14} className="me-1" />
                        {course.duration}h
                      </div>
                      {renderStars(course.rating)}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Completion</small>
                        <small className="fw-medium">
                          {course.completed}/{course.enrolled}
                        </small>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${(course.completed / course.enrolled) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-ghost-primary"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <Eye size={14} className="me-1" />
                        Details
                      </button>
                      <div>
                        <button className="btn btn-sm btn-ghost-primary">
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-5 text-muted">
                <GraduationCap size={48} className="mb-3 opacity-50" />
                <p>Aucune formation trouvee</p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'progress' && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Progression par employe</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover card-table">
              <thead>
                <tr>
                  <th>Employe</th>
                  <th>Formations inscrites</th>
                  <th>Completees</th>
                  <th>Progression</th>
                  <th>Heures</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployeeProgress.map((emp, index) => (
                  <tr key={index}>
                    <td className="fw-medium">{emp.name}</td>
                    <td>{emp.courses}</td>
                    <td>{emp.completed}</td>
                    <td style={{ width: 150 }}>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(emp.completed / emp.courses) * 100}%` }}
                          />
                        </div>
                        <small className="ms-2 text-muted">
                          {Math.round((emp.completed / emp.courses) * 100)}%
                        </small>
                      </div>
                    </td>
                    <td>{emp.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Inscriptions vs Completions (6 mois)</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockMonthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#3b82f6" name="Inscriptions" />
                    <Bar dataKey="completions" fill="#10b981" name="Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Par categorie</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={mockCategoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockCategoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                  {mockCategoryDistribution.map(item => (
                    <div key={item.name} className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-1"
                        style={{ width: 8, height: 8, backgroundColor: item.color }}
                      />
                      <small>{item.name}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">{selectedCourse.title}</h5>
                  <small className="text-muted">Par {selectedCourse.instructor}</small>
                </div>
                <button className="btn-close" onClick={() => setSelectedCourse(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {getCategoryBadge(selectedCourse.category)}
                      {getLevelBadge(selectedCourse.level)}
                      {selectedCourse.mandatory && (
                        <span className="badge bg-danger">Obligatoire</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Duree</small>
                      <span className="fw-medium">{selectedCourse.duration} heures</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Note</small>
                      {renderStars(selectedCourse.rating)}
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Type</small>
                      <span className="text-capitalize">{selectedCourse.type}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">Inscrits</small>
                      <span className="fw-medium">{selectedCourse.enrolled} employes</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Completions</small>
                      <span className="fw-medium">{selectedCourse.completed} employes</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Taux de completion</small>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(selectedCourse.completed / selectedCourse.enrolled) * 100}%` }}
                          />
                        </div>
                        <span className="ms-2 fw-medium">
                          {Math.round((selectedCourse.completed / selectedCourse.enrolled) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedCourse(null)}>
                  Fermer
                </button>
                <button className="btn btn-outline-primary">
                  <Users size={14} className="me-1" />
                  Voir inscrits
                </button>
                <button className="btn btn-primary">
                  <Play size={14} className="me-1" />
                  Lancer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Course Modal */}
      {showNewModal && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle formation</h5>
                <button className="btn-close" onClick={() => setShowNewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre</label>
                  <input type="text" className="form-control" placeholder="Titre de la formation" />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Categorie</label>
                    <select className="form-select">
                      {Object.entries(CATEGORIES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Niveau</label>
                    <select className="form-select">
                      {Object.entries(LEVELS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select className="form-select">
                      <option value="video">Video</option>
                      <option value="interactive">Interactif</option>
                      <option value="workshop">Atelier</option>
                      <option value="document">Document</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Duree (heures)</label>
                    <input type="number" className="form-control" placeholder="ex: 4" />
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Instructeur</label>
                  <input type="text" className="form-control" placeholder="Nom de l'instructeur" />
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input type="checkbox" className="form-check-input" />
                    <span className="form-check-label">Formation obligatoire</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={() => {
                  toast.success('Formation creee');
                  setShowNewModal(false);
                }}>
                  Creer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingsView;
