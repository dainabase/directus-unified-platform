/**
 * Project Timeline Component
 *
 * Client portal project progress:
 * - Milestone tracking
 * - Status updates
 * - Document access
 *
 * @date 15 Décembre 2025
 */

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API_BASE = '/api/commercial';

const ProjectTimeline = ({ projectId }) => {
  const { authFetch } = useClientAuth();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_BASE}/projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load project');
      }

      setProject(data.project);
      setMilestones(data.project.milestones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      delayed: '⚠️',
      blocked: '🚫'
    };
    return icons[status] || '⏳';
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'text-muted',
      in_progress: 'text-primary',
      completed: 'text-success',
      delayed: 'text-warning',
      blocked: 'text-danger'
    };
    return classes[status] || 'text-muted';
  };

  const getProgressPercentage = () => {
    if (!milestones.length) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getPhaseStatus = (phase) => {
    const statuses = {
      planning: { label: 'Planification', icon: '📋' },
      design: { label: 'Design', icon: '🎨' },
      development: { label: 'Développement', icon: '💻' },
      testing: { label: 'Tests', icon: '🧪' },
      review: { label: 'Revue', icon: '👁️' },
      delivery: { label: 'Livraison', icon: '🚀' }
    };
    return statuses[phase] || { label: phase, icon: '📌' };
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement du projet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadProject}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="alert alert-warning" role="alert">
        Projet introuvable.
      </div>
    );
  }

  const progress = getProgressPercentage();

  return (
    <div className="project-timeline">
      {/* Project Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="mb-1">{project.name}</h5>
              <p className="text-muted mb-2">{project.description}</p>
              <div className="d-flex gap-3">
                <small className="text-muted">
                  <strong>Début:</strong> {formatDate(project.start_date)}
                </small>
                <small className="text-muted">
                  <strong>Fin prévue:</strong> {formatDate(project.end_date)}
                </small>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex align-items-center justify-content-md-end">
                <div className="me-3 text-end">
                  <h3 className="mb-0">{progress}%</h3>
                  <small className="text-muted">Progression</small>
                </div>
                <div style={{ width: '80px', height: '80px' }}>
                  <svg viewBox="0 0 36 36" className="w-100 h-100">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e9ecef"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#0d6efd"
                      strokeWidth="3"
                      strokeDasharray={`${progress}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">
              {milestones.filter(m => m.status === 'completed').length} / {milestones.length} étapes complétées
            </small>
            <small className="text-muted">
              {milestones.filter(m => m.status === 'in_progress').length} en cours
            </small>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {milestones.length > 0 ? (
        <div className="timeline">
          {milestones.map((milestone, index) => {
            const phase = getPhaseStatus(milestone.phase);
            const isCompleted = milestone.status === 'completed';
            const isCurrent = milestone.status === 'in_progress';

            return (
              <div
                key={milestone.id || index}
                className={`card mb-3 ${isCurrent ? 'border-primary' : ''}`}
              >
                <div className="card-body">
                  <div className="row align-items-center">
                    {/* Status Icon */}
                    <div className="col-auto">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          isCompleted ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-light'
                        }`}
                        style={{ width: '48px', height: '48px' }}
                      >
                        <span className={isCompleted || isCurrent ? 'text-white' : ''}>
                          {phase.icon}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="col">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            {milestone.title}
                            {isCurrent && (
                              <span className="badge bg-primary ms-2">En cours</span>
                            )}
                          </h6>
                          <p className="text-muted small mb-0">{milestone.description}</p>
                        </div>
                        <div className="text-end">
                          <span className={getStatusClass(milestone.status)}>
                            {getStatusIcon(milestone.status)}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="d-flex gap-3 mt-2">
                        <small className="text-muted">
                          <strong>Prévu:</strong> {formatDate(milestone.due_date)}
                        </small>
                        {isCompleted && milestone.completed_at && (
                          <small className="text-success">
                            <strong>Terminé:</strong> {formatDate(milestone.completed_at)}
                          </small>
                        )}
                      </div>

                      {/* Deliverables */}
                      {milestone.deliverables?.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">Livrables:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {milestone.deliverables.map((deliverable, idx) => (
                              <span key={idx} className="badge bg-light text-dark">
                                {deliverable}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <span className="display-4 text-muted">📅</span>
            <p className="mt-3 mb-0 text-muted">Aucune étape définie pour ce projet</p>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {project.documents?.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">Documents du projet</h6>
          </div>
          <ul className="list-group list-group-flush">
            {project.documents.map((doc, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="me-2">📄</span>
                  {doc.name}
                  <small className="text-muted ms-2">{doc.type}</small>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  Télécharger
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;
