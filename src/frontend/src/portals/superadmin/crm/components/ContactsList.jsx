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
  const [openDropdownId, setOpenDropdownId] = useState(null);

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
      active: { label: 'Actif', classes: 'ds-badge ds-badge-success' },
      inactive: { label: 'Inactif', classes: 'ds-badge ds-badge-default' },
      lead: { label: 'Prospect', classes: 'ds-badge ds-badge-warning' },
      customer: { label: 'Client', classes: 'ds-badge ds-badge-info' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={config.classes}>
        {config.label}
      </span>
    );
  };

  return (
    <div>
      {/* Filtres et actions */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="shrink-0">
          <select
            className="ds-input text-sm py-1.5 px-3"
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

        <div className="shrink-0">
          <select
            className="ds-input text-sm py-1.5 px-3"
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

        <div className="shrink-0">
          <select
            className="ds-input text-sm py-1.5 px-3"
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

        <div className="ml-auto flex gap-2">
          {selectedContacts.length > 0 && (
            <button
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{color:'var(--semantic-red)'}}
              onClick={handleDeleteSelected}
              disabled={deleteContact.isPending}
            >
              <Trash2 size={14} className="mr-1 inline" />
              Supprimer ({selectedContacts.length})
            </button>
          )}

          <button
            className="ds-btn ds-btn-ghost text-sm py-1.5"
            onClick={handleExport}
            disabled={exportContacts.isPending}
          >
            <Download size={14} className="mr-1 inline" />
            Exporter
          </button>
        </div>
      </div>

      {/* Tableau des contacts */}
      <div className="ds-card">
        <div className="p-0">
          {contactsQuery.isLoading || globalSearch.isLoading ? (
            <div className="text-center py-4">
              <RefreshCw size={24} className="animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">Chargement des contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-gray-400 mb-3 mx-auto" />
              <h4 className="text-gray-500 font-medium">Aucun contact trouvé</h4>
              <p className="text-gray-400">
                {searchQuery ?
                  'Aucun contact ne correspond à vos critères de recherche.' :
                  'Commencez par ajouter votre premier contact.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('first_name')}
                    >
                      <div className="flex items-center">
                        Contact
                        {sortField === 'first_name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Entreprise</th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Statut
                        {sortField === 'status' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('date_created')}
                    >
                      <div className="flex items-center">
                        Créé le
                        {sortField === 'date_created' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 w-8">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {contacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </div>
                            {contact.position && (
                              <div className="text-gray-500 text-xs">
                                {contact.position}
                                {contact.department && ` - ${contact.department}`}
                              </div>
                            )}
                            {contact.tags?.length > 0 && (
                              <div className="mt-1">
                                {contact.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="ds-badge ds-badge-info mr-1">
                                    <Tag size={10} className="mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {contact.tags.length > 2 && (
                                  <span className="text-gray-400 text-xs">
                                    +{contact.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Mail size={16} className="text-gray-400 mr-2" />
                          <a href={`mailto:${contact.email}`} className="text-gray-700 transition-colors">
                            {contact.email}
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {contact.phone ? (
                          <div className="flex items-center">
                            <Phone size={16} className="text-gray-400 mr-2" />
                            <a href={`tel:${contact.phone}`} className="text-gray-700 transition-colors">
                              {contact.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {contact.company?.name ? (
                          <div className="flex items-center">
                            <Building2 size={16} className="text-gray-400 mr-2" />
                            <span className="text-gray-700">{contact.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(contact.status)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-gray-500">
                          {new Date(contact.date_created).toLocaleDateString('fr-CH')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === contact.id ? null : contact.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openDropdownId === contact.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <button
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  onClick={() => { onEdit(contact); setOpenDropdownId(null); }}
                                >
                                  <Edit size={16} className="mr-2" />
                                  Modifier
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                <a
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  href={`mailto:${contact.email}`}
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <Mail size={16} className="mr-2" />
                                  Envoyer un email
                                </a>
                                {contact.phone && (
                                  <a
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    href={`tel:${contact.phone}`}
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    <Phone size={16} className="mr-2" />
                                    Appeler
                                  </a>
                                )}
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  className="w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50" style={{color:'var(--semantic-red)'}}
                                  onClick={() => {
                                    if (window.confirm('Supprimer ce contact ?')) {
                                      deleteContact.mutate(contact.id);
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Supprimer
                                </button>
                              </div>
                            </>
                          )}
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
          <div className="p-4 border-t border-gray-100 flex items-center">
            <p className="m-0 text-gray-500 text-sm">
              Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalContacts)} sur {totalContacts} contacts
            </p>

            <div className="flex items-center gap-1 m-0 ml-auto">
              <button
                className={`ds-btn ds-btn-ghost text-sm py-1.5 px-3 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft size={16} className="mr-1 inline" />
                Précédent
              </button>

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
                  <button
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={currentPage === pageNum ? {background:'var(--accent)'} : undefined}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                className={`ds-btn ds-btn-ghost text-sm py-1.5 px-3 ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Suivant
                <ChevronRight size={16} className="ml-1 inline" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;
