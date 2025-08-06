import React from 'react'

const Sidebar = ({ currentPortal }) => {
  const menuItems = {
    superadmin: [
      { section: 'CRÉER', items: [
        { icon: '➕', label: 'Nouvelle Entreprise', href: '#' },
        { icon: '➕', label: 'Nouveau Contact', href: '#' },
        { icon: '➕', label: 'Nouveau Projet', href: '#' },
        { icon: '➕', label: 'Nouvelle Facture', href: '#' }
      ]},
      { section: 'GÉRER', items: [
        { icon: '📊', label: 'Dashboard', href: '#', active: true },
        { icon: '🏢', label: 'Entreprises', href: '#' },
        { icon: '📁', label: 'Projets & Tâches', href: '#' },
        { icon: '💰', label: 'Finances', href: '#' },
        { icon: '👥', label: 'Prestataires', href: '#' }
      ]},
      { section: 'OUTILS', items: [
        { icon: '📄', label: 'OCR Scanner', href: '#' },
        { icon: '🤖', label: 'Automatisations', href: '#' },
        { icon: '📈', label: 'Rapports', href: '#' }
      ]}
    ],
    client: [
      { section: 'NAVIGATION', items: [
        { icon: '📊', label: 'Dashboard', href: '#', active: true },
        { icon: '📁', label: 'Mes Projets', href: '#' },
        { icon: '📄', label: 'Mes Documents', href: '#' },
        { icon: '💰', label: 'Mes Factures', href: '#' }
      ]},
      { section: 'SUPPORT', items: [
        { icon: '💬', label: 'Messages', href: '#' },
        { icon: '❓', label: 'Aide', href: '#' }
      ]}
    ],
    prestataire: [
      { section: 'TRAVAIL', items: [
        { icon: '📊', label: 'Dashboard', href: '#', active: true },
        { icon: '📋', label: 'Missions', href: '#' },
        { icon: '⏰', label: 'Temps', href: '#' },
        { icon: '💰', label: 'Paiements', href: '#' }
      ]},
      { section: 'OUTILS', items: [
        { icon: '📄', label: 'Documents', href: '#' },
        { icon: '📈', label: 'Statistiques', href: '#' }
      ]}
    ],
    revendeur: [
      { section: 'VENTES', items: [
        { icon: '📊', label: 'Dashboard', href: '#', active: true },
        { icon: '🛒', label: 'Commandes', href: '#' },
        { icon: '📦', label: 'Produits', href: '#' },
        { icon: '👥', label: 'Clients', href: '#' }
      ]},
      { section: 'GESTION', items: [
        { icon: '💰', label: 'Comptabilité', href: '#' },
        { icon: '📈', label: 'Analytics', href: '#' }
      ]}
    ]
  }

  const portalTitles = {
    superadmin: '🚀 SuperAdmin CEO',
    client: '👤 Espace Client',
    prestataire: '🛠️ Espace Prestataire',
    revendeur: '🏪 Espace Revendeur'
  }

  const menu = menuItems[currentPortal] || menuItems.superadmin

  return (
    <aside className="navbar navbar-vertical navbar-expand-lg navbar-dark" 
           style={{ background: '#1e293b' }}>
      <div className="container-fluid">
        <h1 className="navbar-brand text-white">
          {portalTitles[currentPortal]}
        </h1>
        <div className="navbar-collapse">
          <ul className="navbar-nav pt-lg-3">
            {menu.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                <li className="nav-item">
                  <div className="text-uppercase text-muted small px-3 py-2">
                    {section.section}
                  </div>
                </li>
                {section.items.map((item, itemIndex) => (
                  <li className="nav-item" key={itemIndex}>
                    <a 
                      className={`nav-link ${item.active ? 'active' : ''}`} 
                      href={item.href}
                    >
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        {item.icon}
                      </span>
                      <span className="nav-link-title">
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
                {sectionIndex < menu.length - 1 && (
                  <hr className="navbar-divider my-3" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar