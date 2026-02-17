// src/frontend/src/portals/superadmin/marketing/components/EventsManager.jsx
import React, { useState } from 'react';
import {
  Calendar, Users, MapPin, Clock, Plus, Edit2, Trash2,
  Video, Building, Globe, CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockEvents = [
  {
    id: 1,
    title: 'Webinaire: Tendances IA 2025',
    type: 'webinar',
    date: '2024-12-18',
    time: '14:00',
    duration: 60,
    location: 'Zoom',
    capacity: 100,
    registered: 78,
    attended: 0,
    status: 'upcoming',
    description: 'Decouvrez les dernieres tendances en intelligence artificielle'
  },
  {
    id: 2,
    title: 'Afterwork Networking',
    type: 'networking',
    date: '2024-12-20',
    time: '18:00',
    duration: 180,
    location: 'Lausanne, Hotel de la Paix',
    capacity: 50,
    registered: 42,
    attended: 0,
    status: 'upcoming',
    description: 'Rencontrez les entrepreneurs de la region'
  },
  {
    id: 3,
    title: 'Demo Produit: Nouvelle plateforme',
    type: 'demo',
    date: '2024-12-15',
    time: '10:00',
    duration: 45,
    location: 'Google Meet',
    capacity: 30,
    registered: 28,
    attended: 25,
    status: 'completed',
    description: 'Presentation de notre nouvelle solution'
  },
  {
    id: 4,
    title: 'Conference Tech Suisse 2025',
    type: 'conference',
    date: '2025-01-15',
    time: '09:00',
    duration: 480,
    location: 'Palais de Beaulieu, Lausanne',
    capacity: 500,
    registered: 234,
    attended: 0,
    status: 'upcoming',
    description: 'La plus grande conference tech de Suisse romande'
  },
  {
    id: 5,
    title: 'Workshop Design Thinking',
    type: 'workshop',
    date: '2024-12-10',
    time: '13:00',
    duration: 180,
    location: 'Impact Hub Geneve',
    capacity: 20,
    registered: 20,
    attended: 18,
    status: 'completed',
    description: 'Atelier pratique de Design Thinking'
  }
];

const EVENT_TYPES = {
  webinar: { icon: Video, color: 'primary', label: 'Webinaire' },
  networking: { icon: Users, color: 'success', label: 'Networking' },
  demo: { icon: Globe, color: 'info', label: 'Demo' },
  conference: { icon: Building, color: 'warning', label: 'Conference' },
  workshop: { icon: Calendar, color: 'danger', label: 'Workshop' }
};

const EventsManager = ({ selectedCompany }) => {
  const [events, setEvents] = useState(mockEvents);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return e.status === 'upcoming';
    if (filter === 'completed') return e.status === 'completed';
    return e.type === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cet evenement?')) {
      setEvents(events.filter(e => e.id !== id));
      toast.success('Evenement supprime');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'upcoming') {
      return <span className="badge bg-success-lt text-success">A venir</span>;
    }
    return <span className="badge bg-secondary">Termine</span>;
  };

  // Stats
  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    totalRegistered: events.reduce((sum, e) => sum + e.registered, 0),
    totalAttended: events.reduce((sum, e) => sum + e.attended, 0)
  };

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Total evenements</span>
                <span className="fw-bold">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>A venir</span>
                <span className="fw-bold">{stats.upcoming}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Total inscrits</span>
                <span className="fw-bold">{stats.totalRegistered}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Total participants</span>
                <span className="fw-bold">{stats.totalAttended}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`btn btn-sm ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('upcoming')}
          >
            A venir
          </button>
          <button
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Termines
          </button>
          {Object.entries(EVENT_TYPES).map(([key, value]) => (
            <button
              key={key}
              className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(key)}
            >
              {value.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} className="me-1" />
          Nouvel evenement
        </button>
      </div>

      {/* Events Grid */}
      <div className="row g-4">
        {sortedEvents.map(event => {
          const typeInfo = EVENT_TYPES[event.type];
          const Icon = typeInfo.icon;
          const fillRate = event.capacity > 0
            ? Math.round((event.registered / event.capacity) * 100)
            : 0;

          return (
            <div className="col-md-6 col-lg-4" key={event.id}>
              <div className={`card h-100 ${event.status === 'completed' ? 'opacity-75' : ''}`}>
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <div className={`avatar bg-${typeInfo.color}-lt text-${typeInfo.color} me-3`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className={`badge bg-${typeInfo.color}-lt text-${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">{event.title}</h5>
                  <p className="text-muted small mb-3">{event.description}</p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex align-items-center text-muted">
                      <Calendar size={14} className="me-2" />
                      <small>{formatDate(event.date)}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                      <Clock size={14} className="me-2" />
                      <small>{event.time} ({event.duration} min)</small>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                      <MapPin size={14} className="me-2" />
                      <small>{event.location}</small>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Inscriptions</small>
                      <small className="fw-medium">{event.registered}/{event.capacity}</small>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className={`progress-bar ${fillRate >= 90 ? 'bg-danger' : fillRate >= 70 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>

                  {event.status === 'completed' && event.attended > 0 && (
                    <div className="d-flex justify-content-between small text-muted mb-3">
                      <span>Participants</span>
                      <span className="fw-medium">
                        {event.attended} ({Math.round((event.attended / event.registered) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="card-footer d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary flex-grow-1"
                    onClick={() => setSelectedEvent(event)}
                  >
                    Voir details
                  </button>
                  <button
                    className="btn btn-sm btn-ghost-secondary"
                    onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost-danger"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-5 text-muted">
          <Calendar size={48} className="mb-3 opacity-50" />
          <p>Aucun evenement trouve</p>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
