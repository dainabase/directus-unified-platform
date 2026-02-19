import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ChevronDown, 
  ChevronRight,
  // Finance
  Wallet, 
  Landmark, 
  Calculator, 
  FileText, 
  Receipt, 
  Scale,
  PiggyBank,
  CreditCard,
  RefreshCw,
  // Projets
  FolderKanban,
  TrendingUp,
  ListTodo,
  Clock,
  // CRM
  Users,
  Building2,
  Target,
  HeartHandshake,
  // Marketing
  Megaphone,
  Calendar,
  Mail,
  BarChart3,
  // RH
  UserCog,
  GraduationCap,
  UserPlus,
  Trophy,
  // Juridique
  Gavel,
  FileCheck,
  Shield,
  // Support
  Headphones,
  Bell,
  MessageSquare,
  // Prestataires
  Wrench,
  // Paramètres
  Settings,
  Building,
  Key,
  Plug
} from 'lucide-react';

// Configuration des pôles et sous-modules
const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/superadmin',
    isGroup: false
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    isGroup: true,
    children: [
      { id: 'banking', label: 'Banking', icon: Landmark, path: '/superadmin/banking' },
      { id: 'accounting', label: 'Comptabilité', icon: Calculator, path: '/superadmin/accounting' },
      { id: 'invoices-client', label: 'Factures Clients', icon: FileText, path: '/superadmin/invoices/clients' },
      { id: 'invoices-supplier', label: 'Factures Fournisseurs', icon: Receipt, path: '/superadmin/invoices/suppliers' },
      { id: 'collection', label: 'Recouvrement', icon: Scale, path: '/superadmin/collection' },
      { id: 'budgets', label: 'Budgets', icon: PiggyBank, path: '/superadmin/budgets' },
      { id: 'expenses', label: 'Dépenses', icon: CreditCard, path: '/superadmin/expenses' },
      { id: 'subscriptions', label: 'Abonnements', icon: RefreshCw, path: '/superadmin/subscriptions' },
    ]
  },
  {
    id: 'projects',
    label: 'Projets',
    icon: FolderKanban,
    isGroup: true,
    children: [
      { id: 'projects-dashboard', label: 'Tableau de bord', icon: TrendingUp, path: '/superadmin/projects/dashboard' },
      { id: 'projects-list', label: 'Tous les Projets', icon: FolderKanban, path: '/superadmin/projects' },
      { id: 'deliverables', label: 'Livrables & Tâches', icon: ListTodo, path: '/superadmin/deliverables' },
      { id: 'time-tracking', label: 'Time Tracking', icon: Clock, path: '/superadmin/time-tracking' },
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    isGroup: true,
    children: [
      { id: 'leads', label: 'Leads', icon: UserPlus, path: '/superadmin/leads' },
      { id: 'quotes', label: 'Devis', icon: FileText, path: '/superadmin/quotes' },
      { id: 'contacts', label: 'Contacts', icon: Users, path: '/superadmin/crm/contacts' },
      { id: 'companies', label: 'Entreprises', icon: Building2, path: '/superadmin/crm/companies' },
      { id: 'pipeline', label: 'Pipeline Commercial', icon: Target, path: '/superadmin/crm/pipeline' },
      { id: 'customer-success', label: 'Customer Success', icon: HeartHandshake, path: '/superadmin/crm/success' },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    isGroup: true,
    children: [
      { id: 'content-calendar', label: 'Calendrier Éditorial', icon: Calendar, path: '/superadmin/marketing/calendar' },
      { id: 'campaigns', label: 'Campagnes Email', icon: Mail, path: '/superadmin/marketing/campaigns' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/superadmin/marketing/analytics' },
      { id: 'events', label: 'Événements', icon: Calendar, path: '/superadmin/marketing/events' },
    ]
  },
  {
    id: 'hr',
    label: 'Ressources Humaines',
    icon: UserCog,
    isGroup: true,
    children: [
      { id: 'team', label: 'Équipe', icon: Users, path: '/superadmin/hr/team' },
      { id: 'talents', label: 'Talents', icon: Trophy, path: '/superadmin/hr/talents' },
      { id: 'recruitment', label: 'Recrutement', icon: UserPlus, path: '/superadmin/hr/recruitment' },
      { id: 'trainings', label: 'Formations', icon: GraduationCap, path: '/superadmin/hr/trainings' },
      { id: 'performance', label: 'Performance', icon: BarChart3, path: '/superadmin/hr/performance' },
    ]
  },
  {
    id: 'legal',
    label: 'Juridique',
    icon: Gavel,
    isGroup: true,
    children: [
      { id: 'contracts', label: 'Contrats', icon: FileCheck, path: '/superadmin/legal/contracts' },
      { id: 'cgv', label: 'CGV & Mentions', icon: FileText, path: '/superadmin/legal/cgv' },
      { id: 'compliance', label: 'Compliance', icon: Shield, path: '/superadmin/legal/compliance' },
    ]
  },
  {
    id: 'support',
    label: 'Support',
    icon: Headphones,
    isGroup: true,
    children: [
      { id: 'tickets', label: 'Tickets', icon: MessageSquare, path: '/superadmin/support/tickets' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/superadmin/support/notifications' },
    ]
  },
  {
    id: 'providers',
    label: 'Prestataires',
    icon: Wrench,
    path: '/superadmin/providers',
    isGroup: false
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    isGroup: true,
    children: [
      { id: 'owner-companies', label: 'Mes Entreprises', icon: Building, path: '/superadmin/settings/companies' },
      { id: 'users', label: 'Utilisateurs', icon: Users, path: '/superadmin/settings/users' },
      { id: 'permissions', label: 'Permissions', icon: Key, path: '/superadmin/settings/permissions' },
      { id: 'integrations', label: 'Intégrations', icon: Plug, path: '/superadmin/settings/integrations' },
    ]
  },
];

// Composant NavGroup avec dropdown
const NavGroup = ({ item, isExpanded, onToggle, location }) => {
  const Icon = item.icon;
  const hasActiveChild = item.children?.some(child => location.pathname === child.path);
  
  return (
    <div className="mb-1">
      {/* Header du groupe */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-lg
          transition-all duration-200 group
          ${hasActiveChild 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={hasActiveChild ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'} />
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        {isExpanded 
          ? <ChevronDown size={16} className="text-gray-400" />
          : <ChevronRight size={16} className="text-gray-400" />
        }
      </button>
      
      {/* Children avec animation */}
      <div className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            const isActive = location.pathname === child.path;
            
            return (
              <NavLink
                key={child.id}
                to={child.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <ChildIcon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Composant NavItem simple (sans children)
const NavItem = ({ item, location }) => {
  const Icon = item.icon;
  const isActive = location.pathname === item.path;
  
  return (
    <NavLink
      to={item.path}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
        transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
      <span className="font-medium text-sm">{item.label}</span>
    </NavLink>
  );
};

// Composant Sidebar principal
const Sidebar = () => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Ouvrir automatiquement le groupe actif
    const activeGroup = navigationConfig.find(item => 
      item.isGroup && item.children?.some(child => location.pathname.startsWith(child.path))
    );
    return activeGroup ? [activeGroup.id] : ['finance']; // Finance ouvert par défaut
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 overflow-y-auto z-40">
      <div className="p-4">
        {/* Logo Section */}
        <div className="mb-6 px-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigationConfig.map((item) => (
            item.isGroup ? (
              <NavGroup
                key={item.id}
                item={item}
                isExpanded={expandedGroups.includes(item.id)}
                onToggle={() => toggleGroup(item.id)}
                location={location}
              />
            ) : (
              <NavItem
                key={item.id}
                item={item}
                location={location}
              />
            )
          ))}
        </nav>

        {/* Footer avec version */}
        <div className="mt-8 pt-4 border-t border-gray-100">
          <div className="px-3 text-xs text-gray-400">
            <p>Unified Platform v2.1</p>
            <p className="mt-1">5 entreprises • 83 collections</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
