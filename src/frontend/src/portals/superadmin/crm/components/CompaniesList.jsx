// src/frontend/src/portals/superadmin/crm/components/CompaniesList.jsx
import React, { useState } from 'react';
import {
  Building2, Search, Filter, Download,
  Plus, Edit, Trash2, Globe, Phone,
  Users, MapPin, RefreshCw, MoreVertical,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  useCompanies,
  useDeleteCompany,
  useGlobalCRMSearch
} from '../hooks/useCRMData';

const CompaniesList = ({ company, searchQuery, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    size: 'all'
  });
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [sortField, setSortField] = useState('date_created');
  const [sortDirection, setSortDirection] = useState('desc');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const companiesQuery = useCompanies({
    limit: pageSize,
    offset: currentPage * pageSize,
    sort: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
    ...filters.status !== 'all' && { status: filters.status },
    ...filters.industry !== 'all' && { industry: filters.industry },
    ...filters.size !== 'all' && { size: filters.size },
    ...searchQuery && { search: searchQuery }
  });

  const deleteCompany = useDeleteCompany();
  const globalSearch = useGlobalCRMSearch(searchQuery, !!searchQuery);

  // Utiliser les résultats de recherche si disponibles
  const companies = searchQuery ? globalSearch.companies : companiesQuery.data?.data || [];
  const totalCompanies = searchQuery ? globalSearch.companies.length : companiesQuery.data?.meta?.filter_count || 0;
  const totalPages = Math.ceil(totalCompanies / pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleSelectCompany = (companyId, checked) => {
    if (checked) {
      setSelectedCompanies([...selectedCompanies, companyId]);
    } else {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCompanies(companies.map(c => c.id));
    } else {
      setSelectedCompanies([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Supprimer ${selectedCompanies.length} entreprise(s) sélectionnée(s) ?`)) {
      for (const companyId of selectedCompanies) {
        await deleteCompany.mutateAsync(companyId);
      }
      setSelectedCompanies([]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', classes: 'ds-badge ds-badge-success' },
      inactive: { label: 'Inactive', classes: 'ds-badge ds-badge-default' },
      prospect: { label: 'Prospect', classes: 'ds-badge ds-badge-warning' },
      customer: { label: 'Client', classes: 'ds-badge ds-badge-info' },
      partner: { label: 'Partenaire', classes: 'ds-badge ds-badge-info' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={config.classes}>
        {config.label}
      </span>
    );
  };

  const formatRevenue = (revenue) => {
    if (!revenue) return '-';
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0
    }).format(revenue);
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
            <option value="active">Actives</option>
            <option value="prospect">Prospects</option>
            <option value="customer">Clients</option>
            <option value="partner">Partenaires</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>

        <div className="shrink-0">
          <select
            className="ds-input text-sm py-1.5 px-3"
            value={filters.industry}
            onChange={(e) => {
              setFilters({...filters, industry: e.target.value});
              setCurrentPage(0);
            }}
          >
            <option value="all">Tous les secteurs</option>
            <option value="Technologie">Technologie</option>
            <option value="Finance et banque">Finance et banque</option>
            <option value="Immobilier">Immobilier</option>
            <option value="Santé">Santé</option>
            <option value="Consulting">Consulting</option>
          </select>
        </div>

        <div className="shrink-0">
          <select
            className="ds-input text-sm py-1.5 px-3"
            value={filters.size}
            onChange={(e) => {
              setFilters({...filters, size: e.target.value});
              setCurrentPage(0);
            }}
          >
            <option value="all">Toutes les tailles</option>
            <option value="1-10">1-10 employés</option>
            <option value="11-50">11-50 employés</option>
            <option value="51-250">51-250 employés</option>
            <option value="251-1000">251-1000 employés</option>
            <option value="1000+">1000+ employés</option>
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
          {selectedCompanies.length > 0 && (
            <button
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{color:'var(--semantic-red)'}}
              onClick={handleDeleteSelected}
              disabled={deleteCompany.isPending}
            >
              <Trash2 size={14} className="mr-1 inline" />
              Supprimer ({selectedCompanies.length})
            </button>
          )}
        </div>
      </div>

      {/* Tableau des entreprises */}
      <div className="ds-card">
        <div className="p-0">
          {companiesQuery.isLoading || globalSearch.isLoading ? (
            <div className="text-center py-4">
              <RefreshCw size={24} className="animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-2">Chargement des entreprises...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-5">
              <Building2 size={48} className="text-gray-400 mb-3 mx-auto" />
              <h4 className="text-gray-500 font-medium">Aucune entreprise trouvée</h4>
              <p className="text-gray-400">
                {searchQuery ?
                  'Aucune entreprise ne correspond à vos critères de recherche.' :
                  'Commencez par ajouter votre première entreprise.'
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
                        checked={selectedCompanies.length === companies.length && companies.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Entreprise
                        {sortField === 'name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort('industry')}
                    >
                      <div className="flex items-center">
                        Secteur
                        {sortField === 'industry' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3">Taille</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">CA annuel</th>
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
                        Créée le
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
                  {companies.map(company => (
                    <tr key={company.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => handleSelectCompany(company.id, e.target.checked)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{company.name}</div>
                            {company.website && (
                              <div className="text-gray-500 text-xs flex items-center">
                                <Globe size={12} className="mr-1" />
                                <a
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-500 transition-colors"
                                >
                                  {company.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            {company.address && (
                              <div className="text-gray-500 text-xs flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {company.city}, {company.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {company.industry ? (
                          <span className="ds-badge ds-badge-info">
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {company.size ? (
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-400 mr-2" />
                            <span className="text-gray-700">{company.size}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          {company.email && (
                            <div className="text-gray-500 text-xs">
                              {company.email}
                            </div>
                          )}
                          {company.phone && (
                            <div className="text-gray-500 text-xs">
                              {company.phone}
                            </div>
                          )}
                          {!company.email && !company.phone && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-gray-500">
                          {formatRevenue(company.annual_revenue)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {getStatusBadge(company.status)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-gray-500">
                          {new Date(company.date_created).toLocaleDateString('fr-CH')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === company.id ? null : company.id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openDropdownId === company.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <button
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  onClick={() => { onEdit(company); setOpenDropdownId(null); }}
                                >
                                  <Edit size={16} className="mr-2" />
                                  Modifier
                                </button>
                                <div className="border-t border-gray-100 my-1" />
                                {company.website && (
                                  <a
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    <Globe size={16} className="mr-2" />
                                    Visiter le site
                                  </a>
                                )}
                                {company.email && (
                                  <a
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    href={`mailto:${company.email}`}
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    <Phone size={16} className="mr-2" />
                                    Envoyer un email
                                  </a>
                                )}
                                <div className="border-t border-gray-100 my-1" />
                                <button
                                  className="w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50" style={{color:'var(--semantic-red)'}}
                                  onClick={() => {
                                    if (window.confirm('Supprimer cette entreprise ?')) {
                                      deleteCompany.mutate(company.id);
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
              Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalCompanies)} sur {totalCompanies} entreprises
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

export default CompaniesList;
