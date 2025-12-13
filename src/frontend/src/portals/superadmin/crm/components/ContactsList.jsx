// src/frontend/src/portals/superadmin/crm/components/ContactsList.jsx
import React, { useState } from 'react';
import { 
  Users, Search, Filter, Download, 
  Plus, Edit, Trash2, Mail, Phone,
  Building2, MapPin, Tag, RefreshCw,
  ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { 
  useContacts, 
  useDeleteContact, 
  useExportContacts,
  useGlobalCRMSearch 
} from '../hooks/useCRMData';

const ContactsList = ({ company, searchQuery, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    hasCompany: 'all'
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sortField, setSortField] = useState('date_created');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const contactsQuery = useContacts({
    limit: pageSize,
    offset: currentPage * pageSize,
    company: company,
    sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
    ...filters.status !== 'all' && { status: filters.status },
    ...filters.source !== 'all' && { source: filters.source },
    ...searchQuery && { search: searchQuery }
  });
  
  const deleteContact = useDeleteContact();
  const exportContacts = useExportContacts();
  const globalSearch = useGlobalCRMSearch(searchQuery, !!searchQuery);
  
  // Utiliser les résultats de recherche si disponibles
  const contacts = searchQuery ? globalSearch.contacts : contactsQuery.data?.data || [];
  const totalContacts = searchQuery ? globalSearch.contacts.length : contactsQuery.data?.meta?.filter_count || 0;
  const totalPages = Math.ceil(totalContacts / pageSize);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };
  
  const handleSelectContact = (contactId, checked) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedContacts(contacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };
  
  const handleDeleteSelected = async () => {
    if (window.confirm(`Supprimer ${selectedContacts.length} contact(s) sélectionné(s) ?`)) {
      for (const contactId of selectedContacts) {
        await deleteContact.mutateAsync(contactId);
      }
      setSelectedContacts([]);
    }
  };
  
  const handleExport = () => {
    const exportFilters = {
      ...company && { company },
      ...filters.status !== 'all' && { status: filters.status },
      ...searchQuery && { search: searchQuery }
    };
    exportContacts.mutate(exportFilters);
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', class: 'bg-success' },
      inactive: { label: 'Inactif', class: 'bg-secondary' },
      lead: { label: 'Prospect', class: 'bg-warning' },
      customer: { label: 'Client', class: 'bg-primary' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div>
      {/* Filtres et actions */}
      <div className="row g-2 align-items-center mb-3">
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
            value={filters.status}
            onChange={(e) => {
              setFilters({...filters, status: e.target.value});
              setCurrentPage(0);
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="lead">Prospects</option>
            <option value="customer">Clients</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
            value={filters.source}
            onChange={(e) => {
              setFilters({...filters, source: e.target.value});
              setCurrentPage(0);
            }}
          >
            <option value="all">Toutes les sources</option>
            <option value="manual">Saisie manuelle</option>
            <option value="import">Import</option>
            <option value="website">Site web</option>
            <option value="referral">Référence</option>
            <option value="event">Événement</option>
            <option value="social">Réseaux sociaux</option>
          </select>
        </div>
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(0);
            }}
          >
            <option value="25">25 par page</option>
            <option value="50">50 par page</option>
            <option value="100">100 par page</option>
          </select>
        </div>
        
        <div className="col-auto ms-auto">
          <div className="btn-group" role="group">
            {selectedContacts.length > 0 && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleDeleteSelected}
                disabled={deleteContact.isPending}
              >
                <Trash2 size={14} className="me-1" />
                Supprimer ({selectedContacts.length})
              </button>
            )}
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={handleExport}
              disabled={exportContacts.isPending}
            >
              <Download size={14} className="me-1" />
              Exporter
            </button>
          </div>
        </div>
      </div>
      
      {/* Tableau des contacts */}
      <div className="card">
        <div className="card-body p-0">
          {contactsQuery.isLoading || globalSearch.isLoading ? (
            <div className="text-center py-4">
              <RefreshCw size={24} className="animate-spin text-muted" />
              <p className="text-muted mt-2">Chargement des contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <h4 className="text-muted">Aucun contact trouvé</h4>
              <p className="text-muted">
                {searchQuery ? 
                  'Aucun contact ne correspond à vos critères de recherche.' :
                  'Commencez par ajouter votre premier contact.'
                }
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-vcenter table-mobile-md card-table">
                <thead>
                  <tr>
                    <th className="w-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('first_name')}
                    >
                      <div className="d-flex align-items-center">
                        Contact
                        {sortField === 'first_name' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="d-flex align-items-center">
                        Email
                        {sortField === 'email' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th>Téléphone</th>
                    <th>Entreprise</th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="d-flex align-items-center">
                        Statut
                        {sortField === 'status' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('date_created')}
                    >
                      <div className="d-flex align-items-center">
                        Créé le
                        {sortField === 'date_created' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="w-1">Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                        />
                      </td>
                      
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm me-3">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-weight-medium">
                              {contact.first_name} {contact.last_name}
                            </div>
                            {contact.position && (
                              <div className="text-muted small">
                                {contact.position}
                                {contact.department && ` - ${contact.department}`}
                              </div>
                            )}
                            {contact.tags?.length > 0 && (
                              <div className="mt-1">
                                {contact.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="badge bg-blue-lt me-1">
                                    <Tag size={10} className="me-1" />
                                    {tag}
                                  </span>
                                ))}
                                {contact.tags.length > 2 && (
                                  <span className="text-muted small">
                                    +{contact.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="d-flex align-items-center">
                          <Mail size={16} className="text-muted me-2" />
                          <a href={`mailto:${contact.email}`} className="text-reset">
                            {contact.email}
                          </a>
                        </div>
                      </td>
                      
                      <td>
                        {contact.phone ? (
                          <div className="d-flex align-items-center">
                            <Phone size={16} className="text-muted me-2" />
                            <a href={`tel:${contact.phone}`} className="text-reset">
                              {contact.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      
                      <td>
                        {contact.company?.name ? (
                          <div className="d-flex align-items-center">
                            <Building2 size={16} className="text-muted me-2" />
                            <span>{contact.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      
                      <td>
                        {getStatusBadge(contact.status)}
                      </td>
                      
                      <td>
                        <span className="text-muted">
                          {new Date(contact.date_created).toLocaleDateString('fr-CH')}
                        </span>
                      </td>
                      
                      <td>
                        <div className="dropdown">
                          <button 
                            className="btn btn-ghost-secondary btn-sm"
                            data-bs-toggle="dropdown"
                          >
                            <MoreVertical size={16} />
                          </button>
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item"
                              onClick={() => onEdit(contact)}
                            >
                              <Edit size={16} className="me-2" />
                              Modifier
                            </button>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href={`mailto:${contact.email}`}
                            >
                              <Mail size={16} className="me-2" />
                              Envoyer un email
                            </a>
                            {contact.phone && (
                              <a
                                className="dropdown-item"
                                href={`tel:${contact.phone}`}
                              >
                                <Phone size={16} className="me-2" />
                                Appeler
                              </a>
                            )}
                            <div className="dropdown-divider" />
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => {
                                if (window.confirm('Supprimer ce contact ?')) {
                                  deleteContact.mutate(contact.id);
                                }
                              }}
                            >
                              <Trash2 size={16} className="me-2" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!searchQuery && totalPages > 1 && (
          <div className="card-footer d-flex align-items-center">
            <p className="m-0 text-muted">
              Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalContacts)} sur {totalContacts} contacts
            </p>
            
            <ul className="pagination m-0 ms-auto">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
              </li>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage <= 2) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <li 
                    key={pageNum}
                    className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;