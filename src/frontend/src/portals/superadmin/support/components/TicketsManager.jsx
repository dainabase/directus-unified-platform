// src/frontend/src/portals/superadmin/support/components/TicketsManager.jsx
import React, { useState } from 'react';
import {
  Ticket, Plus, Search, Filter, Eye, MessageSquare, Clock,
  User, AlertCircle, CheckCircle, XCircle, MoreVertical,
  ArrowUp, ArrowDown, Paperclip, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockTickets = [
  {
    id: 'TKT-1234',
    subject: 'Probleme de connexion API',
    description: 'Impossible de se connecter a l\'API depuis ce matin. Erreur 401.',
    status: 'open',
    priority: 'high',
    category: 'technical',
    customer: { name: 'ACME Corporation', email: 'contact@acme.ch' },
    assignee: { name: 'Jean Dupont', avatar: 'JD' },
    created: '2024-12-14T09:30:00',
    updated: '2024-12-14T10:15:00',
    messages: 3
  },
  {
    id: 'TKT-1233',
    subject: 'Question sur la facturation',
    description: 'Je ne comprends pas le montant de ma derniere facture.',
    status: 'pending',
    priority: 'medium',
    category: 'billing',
    customer: { name: 'TechStart SA', email: 'admin@techstart.ch' },
    assignee: { name: 'Marie Martin', avatar: 'MM' },
    created: '2024-12-14T08:45:00',
    updated: '2024-12-14T09:00:00',
    messages: 5
  },
  {
    id: 'TKT-1232',
    subject: 'Demande de nouvelle fonctionnalite',
    description: 'Serait-il possible d\'ajouter un export PDF?',
    status: 'open',
    priority: 'low',
    category: 'feature',
    customer: { name: 'Digital AG', email: 'info@digital.ch' },
    assignee: null,
    created: '2024-12-13T16:20:00',
    updated: '2024-12-13T16:20:00',
    messages: 1
  },
  {
    id: 'TKT-1231',
    subject: 'Bug affichage dashboard',
    description: 'Les graphiques ne s\'affichent pas correctement sur mobile.',
    status: 'resolved',
    priority: 'medium',
    category: 'technical',
    customer: { name: 'Swiss Solutions', email: 'support@swiss-sol.ch' },
    assignee: { name: 'Pierre Blanc', avatar: 'PB' },
    created: '2024-12-12T14:00:00',
    updated: '2024-12-13T11:30:00',
    messages: 8
  },
  {
    id: 'TKT-1230',
    subject: 'Modification abonnement',
    description: 'Je souhaite passer au plan Enterprise.',
    status: 'closed',
    priority: 'low',
    category: 'commercial',
    customer: { name: 'Innovate GmbH', email: 'sales@innovate.ch' },
    assignee: { name: 'Jean Dupont', avatar: 'JD' },
    created: '2024-12-11T10:00:00',
    updated: '2024-12-12T09:00:00',
    messages: 4
  }
];

const CATEGORIES = {
  technical: { label: 'Technique', color: 'primary' },
  billing: { label: 'Facturation', color: 'warning' },
  commercial: { label: 'Commercial', color: 'success' },
  feature: { label: 'Fonctionnalite', color: 'info' },
  other: { label: 'Autre', color: 'secondary' }
};

const PRIORITIES = {
  critical: { label: 'Critique', color: 'danger', icon: ArrowUp },
  high: { label: 'Haute', color: 'warning', icon: ArrowUp },
  medium: { label: 'Moyenne', color: 'info', icon: null },
  low: { label: 'Basse', color: 'secondary', icon: ArrowDown }
};

const TicketsManager = ({ selectedCompany }) => {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge bg-success"><AlertCircle size={12} className="me-1" />Ouvert</span>;
      case 'pending':
        return <span className="badge bg-warning"><Clock size={12} className="me-1" />En attente</span>;
      case 'resolved':
        return <span className="badge bg-info"><CheckCircle size={12} className="me-1" />Resolu</span>;
      case 'closed':
        return <span className="badge bg-secondary"><XCircle size={12} className="me-1" />Ferme</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const info = PRIORITIES[priority];
    const Icon = info?.icon;
    return (
      <span className={`badge bg-${info?.color || 'secondary'}-lt text-${info?.color || 'secondary'}`}>
        {Icon && <Icon size={12} className="me-1" />}
        {info?.label || priority}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: newStatus, updated: new Date().toISOString() } : t
    ));
    toast.success(`Statut mis a jour: ${newStatus}`);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    toast.success('Message envoye');
    setNewMessage('');
  };

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  };

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="ds-card bg-primary-lt">
            <div className="ds-card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Total tickets</span>
                <span className="fw-bold">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card bg-success-lt">
            <div className="ds-card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Ouverts</span>
                <span className="fw-bold">{stats.open}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card bg-warning-lt">
            <div className="ds-card-body py-3">
              <div className="d-flex justify-content-between">
                <span>En attente</span>
                <span className="fw-bold">{stats.pending}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card bg-info-lt">
            <div className="ds-card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Resolus</span>
                <span className="fw-bold">{stats.resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous statuts</option>
            <option value="open">Ouvert</option>
            <option value="pending">En attente</option>
            <option value="resolved">Resolu</option>
            <option value="closed">Ferme</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Toutes priorites</option>
            {Object.entries(PRIORITIES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Toutes categories</option>
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3 text-end">
          <button className="ds-btn ds-btn-primary">
            <Plus size={16} className="me-1" />
            Nouveau ticket
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Tickets List */}
        <div className={selectedTicket ? 'col-lg-5' : 'col-12'}>
          <div className="ds-card">
            <div className="table-responsive">
              <table className="table table-hover card-table table-vcenter">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Priorite</th>
                    <th>Mis a jour</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => {
                    const catInfo = CATEGORIES[ticket.category];
                    return (
                      <tr
                        key={ticket.id}
                        className={`cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-primary-lt' : ''}`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td>
                          <div>
                            <div className="d-flex align-items-center">
                              <span className="text-primary fw-medium me-2">{ticket.id}</span>
                              <span className={`badge bg-${catInfo?.color || 'secondary'}-lt text-${catInfo?.color || 'secondary'}`} style={{ fontSize: '10px' }}>
                                {catInfo?.label}
                              </span>
                            </div>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>
                              {ticket.subject}
                            </small>
                          </div>
                        </td>
                        <td>
                          <small>{ticket.customer.name}</small>
                        </td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{getPriorityBadge(ticket.priority)}</td>
                        <td>
                          <small className="text-muted">{formatDate(ticket.updated)}</small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTickets.length === 0 && (
              <div className="text-center py-5 text-muted">
                <Ticket size={48} className="mb-3 opacity-50" />
                <p>Aucun ticket trouve</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="col-lg-7">
            <div className="ds-card">
              <div className="ds-card-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="ds-card-title mb-1">{selectedTicket.subject}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-primary">{selectedTicket.id}</span>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                  </div>
                  <button className="btn-close" onClick={() => setSelectedTicket(null)}></button>
                </div>
              </div>
              <div className="ds-card-body">
                {/* Customer Info */}
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                  <div className="avatar bg-primary-lt text-primary me-3">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="fw-medium">{selectedTicket.customer.name}</div>
                    <small className="text-muted">{selectedTicket.customer.email}</small>
                  </div>
                  <div className="ms-auto text-end">
                    <small className="text-muted d-block">Cree le</small>
                    <small>{new Date(selectedTicket.created).toLocaleDateString('fr-CH')}</small>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Description</h6>
                  <p>{selectedTicket.description}</p>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 mb-4">
                  <select
                    className="form-select"
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="open">Ouvert</option>
                    <option value="pending">En attente</option>
                    <option value="resolved">Resolu</option>
                    <option value="closed">Ferme</option>
                  </select>
                  <select className="form-select" style={{ width: 'auto' }}>
                    <option>Assigner a...</option>
                    <option>Jean Dupont</option>
                    <option>Marie Martin</option>
                    <option>Pierre Blanc</option>
                  </select>
                </div>

                {/* Messages */}
                <div className="border-top pt-4">
                  <h6 className="mb-3">
                    <MessageSquare size={16} className="me-2" />
                    Conversation ({selectedTicket.messages} messages)
                  </h6>

                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar avatar-sm bg-secondary-lt text-secondary me-2">
                        {selectedTicket.customer.name.charAt(0)}
                      </div>
                      <span className="fw-medium">{selectedTicket.customer.name}</span>
                      <small className="text-muted ms-auto">{formatDate(selectedTicket.created)}</small>
                    </div>
                    <p className="mb-0 small">{selectedTicket.description}</p>
                  </div>

                  {/* Reply Input */}
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ecrire une reponse..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="ds-btn ds-btn-ghost-secondary">
                      <Paperclip size={16} />
                    </button>
                    <button className="ds-btn ds-btn-primary" onClick={handleSendMessage}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsManager;
