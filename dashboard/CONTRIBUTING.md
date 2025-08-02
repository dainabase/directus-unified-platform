# Guide de Contribution - Portal Project

## 📋 Vue d'Ensemble

Ce document décrit les conventions et processus pour contribuer au Portal Project, un système multi-rôles avec espace SuperAdmin intégré.

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
portal-project/
├── 📁 client/              # Pages client (9 pages)
├── 📁 prestataire/         # Pages prestataire (11 pages)  
├── 📁 revendeur/           # Pages revendeur (9 pages)
├── 📁 superadmin/          # Pages superadmin (30+ pages)
│   ├── finance/            # Module finance complet
│   ├── crm/               # CRM unifié
│   ├── projects/          # Gestion projets
│   ├── users/             # Gestion utilisateurs
│   ├── entities/          # Configuration entités
│   ├── automation/        # Workflows n8n
│   └── system/            # Configuration système
├── 📁 assets/
│   ├── css/               # Styles personnalisés
│   ├── img/               # Images et logos
│   ├── js/                # Scripts organisés par rôle
│   │   ├── Core/          # Modules centraux
│   │   ├── Client/        # Scripts client
│   │   ├── Prestataire/   # Scripts prestataire
│   │   ├── Revendeur/     # Scripts revendeur
│   │   ├── Superadmin/    # Scripts superadmin
│   │   └── Optimizations/ # Optimisations performance
│   └── fonts/             # Polices personnalisées
├── 📁 shared/             # Composants partagés
├── 📁 dist/               # Fichiers Tabler.io
├── 📁 server/             # Backend Node.js
├── 📁 tests/              # Tests unitaires et E2E
├── 📁 documentation/      # Documentation technique
└── 📁 config/             # Configurations centralisées
```

## 🎯 Conventions de Développement

### 1. Conventions de Nommage

#### Fichiers HTML
- Pages principales : `[fonction].html` (ex: `dashboard.html`)
- Pages détail : `[fonction]-detail.html` (ex: `project-detail.html`)
- Modals/Composants : `[composant]-[type].html` (ex: `invoice-preview.html`)

#### Fichiers JavaScript
- Modules par rôle : `[module]-[role].js` (ex: `dashboard-client.js`)
- Modules Notion : `[module]-notion.js` (ex: `projects-notion.js`)
- Modules SuperAdmin : `[module]-superadmin.js`

#### Classes CSS
- Préfixes par rôle : `.role-[role]`, `.client-card`, `.superadmin-section`
- États : `.is-active`, `.is-loading`, `.is-error`
- Composants : `.invoice-status`, `.file-card`, `.stat-widget`

#### IDs
- Structure : `#[fonction]-[element]` (ex: `#projects-table`, `#invoice-form`)

### 2. Architecture JavaScript

#### Structure des Modules
```javascript
window.ModuleNameRole = (function() {
    'use strict';
    
    // Configuration
    const config = {
        // Paramètres du module
    };
    
    // État interne
    let state = {
        // Variables d'état
    };
    
    // Fonctions privées
    function privateFunction() {
        // Implémentation
    }
    
    // Interface publique
    return {
        init,
        publicMethod1,
        publicMethod2
    };
})();
```

#### Gestion des Permissions
```javascript
// Vérification permissions
if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.view')) {
    showNotification('Accès refusé', 'error');
    return;
}

// Logging d'audit
await window.AuthSuperadmin.logAuditEvent('ACTION_TYPE', {
    details: 'information'
});
```

### 3. Conventions HTML

#### Structure de Page Standard
```html
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Titre - Rôle Portal</title>
    
    <!-- CSS Tabler -->
    <link href="../dist/css/tabler.min.css" rel="stylesheet"/>
    <link href="../assets/css/custom.css" rel="stylesheet"/>
    <link href="../assets/css/[role]-custom.css" rel="stylesheet"/>
</head>
<body class="layout-fluid role-[role]">
    <div class="page">
        <!-- Sidebar -->
        <!-- Header -->
        <!-- Content -->
    </div>
    
    <!-- Scripts -->
    <script src="../dist/js/tabler.min.js"></script>
    <script src="../assets/js/Core/app.js"></script>
    <script src="../assets/js/[Role]/[module].js"></script>
</body>
</html>
```

## 🔧 Processus de Développement

### 1. Avant de Commencer

1. **Analyser l'existant** : Comprendre la structure actuelle
2. **Vérifier les permissions** : S'assurer des droits d'accès appropriés
3. **Suivre les conventions** : Respecter l'architecture établie

### 2. Développement d'un Nouveau Module

#### Étape 1 : Planification
```bash
# Créer la structure
mkdir -p superadmin/[module]/
touch superadmin/[module]/[pages].html
```

#### Étape 2 : Page HTML
- Utiliser la structure standard
- Inclure les composants partagés appropriés
- Ajouter les scripts spécifiques

#### Étape 3 : Module JavaScript
- Créer dans le dossier approprié (`assets/js/[Role]/`)
- Suivre le pattern de module établi
- Intégrer les permissions et l'audit

#### Étape 4 : Styles CSS
- Ajouter dans `assets/css/[role]-custom.css`
- Utiliser les classes cohérentes
- Respecter le design système

### 3. Intégration des Permissions

#### Vérifications Standard
```javascript
// Au chargement de la page
if (!await window.PermissionsSuperadmin.hasPermission('module.action')) {
    // Redirection ou erreur
}

// Avant actions sensibles
if (!await window.PermissionsSuperadmin.hasPermission('module.write')) {
    showNotification('Permission refusée', 'error');
    return;
}
```

#### Logging d'Audit
```javascript
// Actions importantes
await window.AuthSuperadmin.logAuditEvent('MODULE_ACTION', {
    moduleId: id,
    details: data,
    timestamp: new Date().toISOString()
});
```

## 📊 Gestion des Données

### 1. Données de Démonstration

#### Structure Standard
```javascript
// Données réalistes pour démonstration
const demoData = [
    {
        id: "unique_id",
        status: "active",
        created_at: "2025-01-20T10:00:00Z",
        created_by: "user_name",
        // ... autres champs
    }
];
```

#### Entités Suisses
- Utiliser des formats suisses : CHF, IBAN CH, dates DD.MM.YYYY
- Numéros TVA : CHE-XXX.XXX.XXX TVA
- Adresses réalistes en Suisse

### 2. Intégration Notion (Future)

#### Préparation
```javascript
// Structure prête pour Notion
async function loadFromNotion() {
    // En production: const response = await notionClient.query();
    // En démo: return demoData;
}
```

## 🧪 Tests et Qualité

### 1. Tests Manuels

#### Checklist par Module
- [ ] Chargement de la page
- [ ] Vérification permissions
- [ ] Actions CRUD
- [ ] Gestion d'erreurs
- [ ] Responsive design
- [ ] Audit logging

### 2. Performance

#### Optimisations Requises
- Lazy loading des modules lourds
- Pagination pour listes importantes
- Cache intelligent des données
- Minification en production

## 🚀 Déploiement

### 1. Préparation

#### Vérifications Pré-Déploiement
```bash
# Tests
npm run test

# Build production
npm run build

# Vérification sécurité
npm audit

# Optimisations
npm run optimize
```

### 2. Configuration

#### Variables d'Environnement
- Copier `.env.example` vers `.env`
- Configurer les clés API appropriées
- Définir les URLs de production

#### Nginx
- Utiliser `config/nginx.conf` comme base
- Adapter les domaines et certificats
- Configurer les rate limits

## 🔒 Sécurité

### 1. Bonnes Pratiques

#### Authentification
- Toujours vérifier les sessions
- Implémenter 2FA pour SuperAdmin
- Logger tous les accès sensibles

#### Données
- Valider toutes les entrées utilisateur
- Échapper les sorties HTML
- Ne jamais exposer de secrets côté client

### 2. Audit et Monitoring

#### Événements à Logger
```javascript
// Types d'événements
const auditEvents = {
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGIN_FAILED: 'Échec connexion',
    MODULE_ACCESS: 'Accès module',
    DATA_MODIFIED: 'Modification données',
    PERMISSION_DENIED: 'Accès refusé'
};
```

## 📝 Documentation

### 1. Code

#### Commentaires JavaScript
```javascript
/**
 * Gère la création d'une nouvelle facture
 * @param {Object} invoiceData - Données de la facture
 * @param {boolean} isDraft - Si c'est un brouillon
 * @returns {Promise<string>} ID de la facture créée
 */
async function createInvoice(invoiceData, isDraft = false) {
    // Implémentation
}
```

### 2. Changelog

#### Format Standard
```markdown
## [Version] - Date
### Ajouté
- Nouvelle fonctionnalité

### Modifié
- Amélioration existante

### Corrigé
- Bug résolu

### Sécurité
- Vulnérabilité corrigée
```

## 🤝 Contribution

### 1. Workflow Git

```bash
# Créer une branche
git checkout -b feature/module-name

# Développer et tester
git add .
git commit -m "feat: ajouter module [nom]"

# Pousser et créer PR
git push origin feature/module-name
```

### 2. Standards de Commits

#### Convention
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `perf:` Performance
- `test:` Tests
- `chore:` Maintenance

### 3. Review Checklist

- [ ] Code suit les conventions
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Permissions intégrées
- [ ] Sécurité vérifiée
- [ ] Performance acceptable

## 📞 Support

### Contacts
- **Développement** : équipe technique
- **Architecture** : lead technique
- **Sécurité** : équipe sécurité

### Ressources
- Documentation Tabler.io
- API Notion Documentation  
- Guides de sécurité internes

---

**Dernière mise à jour** : 20 janvier 2025
**Version** : 1.0.0