import React from 'react'
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  BarChart3,
  Wallet,
  Plus,
  Building,
  Folder,
  DollarSign,
  UserCheck,
  FileSearch,
  Bot,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ClipboardList,
  Clock,
  Package,
  ShoppingCart as Cart,
  PieChart,
  Shield,
  User,
  ShoppingCart
} from 'lucide-react'
import styles from './Sidebar.module.css'

const Sidebar = ({ currentPortal, collapsed = false, setCollapsed = () => {}, selectedCompany, onCompanyChange }) => {
  const menuItems = {
    superadmin: [
      { section: 'CRÉER', items: [
        { icon: <Plus size={18} />, label: 'Nouvelle Entreprise', href: '#' },
        { icon: <Plus size={18} />, label: 'Nouveau Contact', href: '#' },
        { icon: <Plus size={18} />, label: 'Nouveau Projet', href: '#' },
        { icon: <Plus size={18} />, label: 'Nouvelle Facture', href: '#' }
      ]},
      { section: 'GÉRER', items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '#', active: true },
        { icon: <Building size={18} />, label: 'Entreprises', href: '#' },
        { icon: <Folder size={18} />, label: 'Projets & Tâches', href: '#' },
        { icon: <DollarSign size={18} />, label: 'Finances', href: '#' },
        { icon: <UserCheck size={18} />, label: 'Prestataires', href: '#' }
      ]},
      { section: 'OUTILS', items: [
        { icon: <FileSearch size={18} />, label: 'OCR Scanner', href: '#' },
        { icon: <Bot size={18} />, label: 'Automatisations', href: '#' },
        { icon: <TrendingUp size={18} />, label: 'Rapports', href: '#' }
      ]}
    ],
    client: [
      { section: 'NAVIGATION', items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '#', active: true },
        { icon: <Folder size={18} />, label: 'Mes Projets', href: '#' },
        { icon: <FileText size={18} />, label: 'Mes Documents', href: '#' },
        { icon: <DollarSign size={18} />, label: 'Mes Factures', href: '#' }
      ]},
      { section: 'SUPPORT', items: [
        { icon: <MessageSquare size={18} />, label: 'Messages', href: '#' },
        { icon: <HelpCircle size={18} />, label: 'Aide', href: '#' }
      ]}
    ],
    prestataire: [
      { section: 'TRAVAIL', items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '#', active: true },
        { icon: <ClipboardList size={18} />, label: 'Missions', href: '#' },
        { icon: <Clock size={18} />, label: 'Temps', href: '#' },
        { icon: <DollarSign size={18} />, label: 'Paiements', href: '#' }
      ]},
      { section: 'OUTILS', items: [
        { icon: <FileText size={18} />, label: 'Documents', href: '#' },
        { icon: <BarChart3 size={18} />, label: 'Statistiques', href: '#' }
      ]}
    ],
    revendeur: [
      { section: 'VENTES', items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '#', active: true },
        { icon: <Cart size={18} />, label: 'Commandes', href: '#' },
        { icon: <Package size={18} />, label: 'Produits', href: '#' },
        { icon: <Users size={18} />, label: 'Clients', href: '#' }
      ]},
      { section: 'GESTION', items: [
        { icon: <DollarSign size={18} />, label: 'Comptabilité', href: '#' },
        { icon: <PieChart size={18} />, label: 'Analytics', href: '#' }
      ]}
    ]
  }

  const portalInfo = {
    superadmin: { 
      title: 'SuperAdmin CEO',
      icon: <LayoutDashboard size={20} />,
      color: '#8B5CF6'
    },
    client: { 
      title: 'Espace Client',
      icon: <Users size={20} />,
      color: '#3B82F6'
    },
    prestataire: { 
      title: 'Espace Prestataire',
      icon: <Briefcase size={20} />,
      color: '#10B981'
    },
    revendeur: { 
      title: 'Espace Revendeur',
      icon: <ShoppingBag size={20} />,
      color: '#F59E0B'
    }
  }

  const menu = menuItems[currentPortal] || menuItems.superadmin
  const portal = portalInfo[currentPortal] || portalInfo.superadmin

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <Building2 size={32} className={styles.logoIcon} />
        {!collapsed && <span className={styles.logoText}>DAINAMICS</span>}
      </div>

      {/* Sélecteur d'entreprise mieux intégré */}
      {!collapsed && (
        <div className={styles.companySelector}>
          <label className={styles.selectorLabel}>ENTREPRISE</label>
          <div className={styles.selectorWrapper}>
            <Building2 size={16} className={styles.selectorIcon} />
            <select 
              className={styles.companyDropdown}
              value={selectedCompany || 'all'}
              onChange={(e) => onCompanyChange && onCompanyChange(e.target.value)}
            >
              <option value="all">Vue Consolidée</option>
              <option value="hypervisual">HYPERVISUAL</option>
              <option value="dainamics">DAINAMICS</option>
              <option value="lexaia">LEXAIA</option>
              <option value="enki">ENKI REALTY</option>
              <option value="takeout">TAKEOUT</option>
            </select>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {setCollapsed && (
        <button 
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}

      {/* Navigation entre portails */}
      <div className={styles.portalNav}>
        <div className={styles.portalTitle}>PORTAILS</div>
        <button 
          className={`${styles.portalItem} ${currentPortal === 'superadmin' ? styles.active : ''}`}
          onClick={() => window.location.href = '#superadmin'}
        >
          <Shield size={20} />
          {!collapsed && <span>SuperAdmin</span>}
        </button>
        <button 
          className={`${styles.portalItem} ${currentPortal === 'client' ? styles.active : ''}`}
          onClick={() => window.location.href = '#client'}
        >
          <User size={20} />
          {!collapsed && <span>Client</span>}
        </button>
        <button 
          className={`${styles.portalItem} ${currentPortal === 'prestataire' ? styles.active : ''}`}
          onClick={() => window.location.href = '#prestataire'}
        >
          <Briefcase size={20} />
          {!collapsed && <span>Prestataire</span>}
        </button>
        <button 
          className={`${styles.portalItem} ${currentPortal === 'revendeur' ? styles.active : ''}`}
          onClick={() => window.location.href = '#revendeur'}
        >
          <ShoppingCart size={20} />
          {!collapsed && <span>Revendeur</span>}
        </button>
      </div>

      {/* Portal Header */}
      <div className={styles.portalHeader} style={{ '--portal-color': portal.color }}>
        <span className={styles.portalIcon}>{portal.icon}</span>
        {!collapsed && <span className={styles.portalTitle}>{portal.title}</span>}
      </div>

      {/* Main Menu */}
      <nav className={styles.nav}>
        {menu.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.navSection}>
            {!collapsed && (
              <div className={styles.sectionTitle}>
                {section.section}
              </div>
            )}
            {section.items.map((item, itemIndex) => (
              <a
                key={itemIndex}
                className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                href={item.href}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {item.active && (
                  <span className={styles.activeIndicator} style={{ background: portal.color }} />
                )}
              </a>
            ))}
          </div>
        ))}

        {/* Quick Stats */}
        {!collapsed && currentPortal === 'superadmin' && (
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <FileText size={16} />
              <div>
                <div className={styles.statValue}>12</div>
                <div className={styles.statLabel}>Tâches</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <BarChart3 size={16} />
              <div>
                <div className={styles.statValue}>€2.4M</div>
                <div className={styles.statLabel}>ARR</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <Wallet size={16} />
              <div>
                <div className={styles.statValue}>7.3m</div>
                <div className={styles.statLabel}>Runway</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Menu */}
        <div className={styles.navBottom}>
          <a className={styles.navItem} href="#settings">
            <span className={styles.navIcon}><Settings size={18} /></span>
            {!collapsed && <span className={styles.navLabel}>Paramètres</span>}
          </a>
          <a className={styles.navItem} href="#logout">
            <span className={styles.navIcon}><LogOut size={18} /></span>
            {!collapsed && <span className={styles.navLabel}>Déconnexion</span>}
          </a>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar