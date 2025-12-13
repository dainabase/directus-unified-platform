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
      active: { label: 'Active', class: 'bg-success' },
      inactive: { label: 'Inactive', class: 'bg-secondary' },
      prospect: { label: 'Prospect', class: 'bg-warning' },
      customer: { label: 'Client', class: 'bg-primary' },
      partner: { label: 'Partenaire', class: 'bg-info' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`badge ${config.class}`}>
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
            <option value="active">Actives</option>
            <option value="prospect">Prospects</option>
            <option value="customer">Clients</option>
            <option value="partner">Partenaires</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
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
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
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
            {selectedCompanies.length > 0 && (
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleDeleteSelected}
                disabled={deleteCompany.isPending}
              >
                <Trash2 size={14} className="me-1" />
                Supprimer ({selectedCompanies.length})
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Tableau des entreprises */}
      <div className="card">
        <div className="card-body p-0">
          {companiesQuery.isLoading || globalSearch.isLoading ? (
            <div className="text-center py-4">
              <RefreshCw size={24} className="animate-spin text-muted" />
              <p className="text-muted mt-2">Chargement des entreprises...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-5">
              <Building2 size={48} className="text-muted mb-3" />
              <h4 className="text-muted">Aucune entreprise trouvée</h4>
              <p className="text-muted">
                {searchQuery ? 
                  'Aucune entreprise ne correspond à vos critères de recherche.' :
                  'Commencez par ajouter votre première entreprise.'
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
                        checked={selectedCompanies.length === companies.length && companies.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="d-flex align-items-center">
                        Entreprise
                        {sortField === 'name' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('industry')}
                    >
                      <div className="d-flex align-items-center">
                        Secteur
                        {sortField === 'industry' && (
                          <span className="ms-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th>Taille</th>
                    <th>Contact</th>
                    <th>CA annuel</th>
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
                        Créée le
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
                  {companies.map(company => (
                    <tr key={company.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={(e) => handleSelectCompany(company.id, e.target.checked)}
                        />
                      </td>
                      
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm me-3">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="font-weight-medium">{company.name}</div>
                            {company.website && (
                              <div className="text-muted small d-flex align-items-center">
                                <Globe size={12} className="me-1" />
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-reset"
                                >
                                  {company.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            {company.address && (
                              <div className="text-muted small d-flex align-items-center">
                                <MapPin size={12} className="me-1" />
                                {company.city}, {company.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        {company.industry ? (
                          <span className="badge bg-blue-lt">
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      
                      <td>
                        {company.size ? (
                          <div className="d-flex align-items-center">
                            <Users size={16} className="text-muted me-2" />
                            <span>{company.size}</span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      
                      <td>
                        <div>
                          {company.email && (
                            <div className="text-muted small">
                              {company.email}
                            </div>
                          )}
                          {company.phone && (
                            <div className="text-muted small">
                              {company.phone}
                            </div>
                          )}
                          {!company.email && !company.phone && (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      
                      <td>
                        <span className="text-muted">
                          {formatRevenue(company.annual_revenue)}
                        </span>
                      </td>
                      
                      <td>
                        {getStatusBadge(company.status)}
                      </td>
                      
                      <td>
                        <span className="text-muted">
                          {new Date(company.date_created).toLocaleDateString('fr-CH')}
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
                              onClick={() => onEdit(company)}
                            >
                              <Edit size={16} className="me-2" />
                              Modifier
                            </button>
                            <div className="dropdown-divider" />
                            {company.website && (
                              <a
                                className="dropdown-item"
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Globe size={16} className="me-2" />
                                Visiter le site
                              </a>
                            )}
                            {company.email && (
                              <a
                                className="dropdown-item"
                                href={`mailto:${company.email}`}
                              >
                                <Phone size={16} className="me-2" />
                                Envoyer un email
                              </a>
                            )}
                            <div className="dropdown-divider" />
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => {
                                if (window.confirm('Supprimer cette entreprise ?')) {
                                  deleteCompany.mutate(company.id);
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
              Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalCompanies)} sur {totalCompanies} entreprises
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

export default CompaniesList;