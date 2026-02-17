// src/frontend/src/portals/superadmin/support/components/NotificationsCenter.jsx
import React, { useState } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Filter, Settings,
  AlertCircle, Info, CheckCircle, AlertTriangle,
  Mail, CreditCard, Users, FileText, Calendar, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockNotifications = [
  {
    id: 1,
    type: 'alert',
    category: 'system',
    title: 'Maintenance programmee',
    message: 'Une maintenance est prevue le 20 decembre de 02h00 a 04h00.',
    read: false,
    created: '2024-12-14T10:00:00',
    actionUrl: null
  },
  {
    id: 2,
    type: 'warning',
    category: 'billing',
    title: 'Facture en retard',
    message: 'La facture FAC-2024-0892 de ACME Corp est en retard de 15 jours.',
    read: false,
    created: '2024-12-14T09:30:00',
    actionUrl: '/superadmin/collection'
  },
  {
    id: 3,
    type: 'info',
    category: 'crm',
    title: 'Nouveau lead',
    message: 'Un nouveau lead a ete cree: TechVenture SA depuis le formulaire web.',
    read: false,
    created: '2024-12-14T08:45:00',
    actionUrl: '/superadmin/leads'
  },
  {
    id: 4,
    type: 'success',
    category: 'billing',
    title: 'Paiement recu',
    message: 'Paiement de CHF 5,400 recu de Digital AG pour FAC-2024-0885.',
    read: true,
    created: '2024-12-13T16:20:00',
    actionUrl: '/superadmin/banking'
  },
  {
    id: 5,
    type: 'info',
    category: 'hr',
    title: 'Demande de conges',
    message: 'Marie Martin a soumis une demande de conges du 23 au 31 decembre.',
    read: true,
    created: '2024-12-13T14:00:00',
    actionUrl: '/superadmin/hr'
  },
  {
    id: 6,
    type: 'warning',
    category: 'system',
    title: 'Espace disque',
    message: 'L\'espace de stockage atteint 85% de la capacite.',
    read: true,
    created: '2024-12-12T11:00:00',
    actionUrl: null
  },
  {
    id: 7,
    type: 'success',
    category: 'project',
    title: 'Projet termine',
    message: 'Le projet "Refonte Site Web" a ete marque comme termine.',
    read: true,
    created: '2024-12-12T09:30:00',
    actionUrl: '/superadmin/projects'
  },
  {
    id: 8,
    type: 'alert',
    category: 'security',
    title: 'Connexion suspecte',
    message: 'Une tentative de connexion depuis une nouvelle localisation a ete detectee.',
    read: false,
    created: '2024-12-11T22:15:00',
    actionUrl: null
  }
];

const NOTIFICATION_TYPES = {
  alert: { icon: AlertCircle, color: 'danger', label: 'Alerte' },
  warning: { icon: AlertTriangle, color: 'warning', label: 'Avertissement' },
  info: { icon: Info, color: 'info', label: 'Information' },
  success: { icon: CheckCircle, color: 'success', label: 'Succes' }
};

const CATEGORIES = {
  system: { icon: Settings, label: 'Systeme' },
  billing: { icon: CreditCard, label: 'Facturation' },
  crm: { icon: Users, label: 'CRM' },
  hr: { icon: Users, label: 'RH' },
  project: { icon: FileText, label: 'Projets' },
  security: { icon: ShieldAlert, label: 'Securite' }
};

const NotificationsCenter = ({ selectedCompany }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    const matchesRead = filterRead === 'all' ||
                        (filterRead === 'unread' && !n.read) ||
                        (filterRead === 'read' && n.read);
    return matchesType && matchesCategory && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquees comme lues');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification supprimee');
  };

  const clearAll = () => {
    if (window.confirm('Supprimer toutes les notifications?')) {
      setNotifications([]);
      toast.success('Notifications supprimees');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'A l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-CH');
  };

  // Stats
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    alerts: notifications.filter(n => n.type === 'alert' && !n.read).length,
    warnings: notifications.filter(n => n.type === 'warning' && !n.read).length
  };

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Total</span>
                <span className="fw-bold">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Non lues</span>
                <span className="fw-bold">{stats.unread}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Alertes</span>
                <span className="fw-bold">{stats.alerts}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning-lt">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between">
                <span>Avertissements</span>
                <span className="fw-bold">{stats.warnings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Tous types</option>
            {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Toutes categories</option>
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <select
            className="form-select form-select-sm"
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={14} className="me-1" />
            Tout marquer comme lu
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} className="me-1" />
            Tout supprimer
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        <div className="list-group list-group-flush">
          {filteredNotifications.map(notification => {
            const typeInfo = NOTIFICATION_TYPES[notification.type];
            const catInfo = CATEGORIES[notification.category];
            const TypeIcon = typeInfo?.icon || Info;
            const CatIcon = catInfo?.icon || Bell;

            return (
              <div
                key={notification.id}
                className={`list-group-item ${!notification.read ? 'bg-light' : ''}`}
              >
                <div className="d-flex align-items-start">
                  <div className={`avatar bg-${typeInfo?.color || 'secondary'}-lt text-${typeInfo?.color || 'secondary'} me-3`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <h6 className={`mb-0 ${!notification.read ? 'fw-bold' : ''}`}>
                          {notification.title}
                        </h6>
                        {!notification.read && (
                          <span className="badge bg-primary" style={{ fontSize: '8px' }}>Nouveau</span>
                        )}
                      </div>
                      <small className="text-muted">{formatDate(notification.created)}</small>
                    </div>
                    <p className="text-muted small mb-2">{notification.message}</p>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${typeInfo?.color || 'secondary'}-lt text-${typeInfo?.color || 'secondary'}`}>
                          {typeInfo?.label}
                        </span>
                        <span className="badge bg-secondary-lt text-secondary">
                          <CatIcon size={10} className="me-1" />
                          {catInfo?.label}
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        {!notification.read && (
                          <button
                            className="btn btn-sm btn-ghost-success"
                            onClick={() => markAsRead(notification.id)}
                            title="Marquer comme lu"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="btn btn-sm btn-ghost-primary"
                            title="Voir"
                          >
                            Voir
                          </a>
                        )}
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => deleteNotification(notification.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredNotifications.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Bell size={48} className="mb-3 opacity-50" />
            <p>Aucune notification</p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <Settings size={16} className="me-2" />
            Preferences de notification
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <h6 className="mb-3">Notifications par email</h6>
              <div className="space-y-2">
                {[
                  { key: 'billing', label: 'Facturation et paiements' },
                  { key: 'leads', label: 'Nouveaux leads' },
                  { key: 'tickets', label: 'Tickets support' },
                  { key: 'security', label: 'Alertes securite' }
                ].map(item => (
                  <div key={item.key} className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`email-${item.key}`}
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor={`email-${item.key}`}>
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="mb-3">Notifications push</h6>
              <div className="space-y-2">
                {[
                  { key: 'urgent', label: 'Alertes urgentes uniquement' },
                  { key: 'mentions', label: 'Mentions et assignations' },
                  { key: 'updates', label: 'Mises a jour systeme' },
                  { key: 'reminders', label: 'Rappels et echeances' }
                ].map(item => (
                  <div key={item.key} className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`push-${item.key}`}
                      defaultChecked={item.key === 'urgent' || item.key === 'mentions'}
                    />
                    <label className="form-check-label" htmlFor={`push-${item.key}`}>
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-top">
            <button className="btn btn-primary">
              Enregistrer les preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
