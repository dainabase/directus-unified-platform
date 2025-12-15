# RAPPORT PARTIE 7 - COMPOSANTS REACT PORTAIL CLIENT

**Date:** 15 Décembre 2025
**Statut:** ✅ COMPLÉTÉ

---

## 📁 Fichiers Créés

```
src/frontend/src/portals/client/
├── index.js                          # Central exports
├── ClientPortalApp.jsx               # Main app + routing
├── context/
│   └── ClientAuthContext.jsx         # Auth context + hooks
├── pages/
│   ├── LoginPage.jsx                 # Login form
│   ├── ActivationPage.jsx            # Account activation
│   ├── ResetPasswordPage.jsx         # Password reset
│   └── ClientPortalDashboard.jsx     # Main dashboard
└── components/
    ├── QuoteViewer.jsx               # Quote display + signature
    ├── InvoicesList.jsx              # Invoices list + filters
    ├── PaymentHistory.jsx            # Payment timeline
    ├── SignatureEmbed.jsx            # DocuSeal iframe
    └── ProjectTimeline.jsx           # Project milestones
```

---

## 🔐 CONTEXT - ClientAuthContext

### Fonctionnalités
- **Token management** avec localStorage
- **Auto-verification** au chargement
- **Login/Logout** sécurisé
- **AuthFetch wrapper** pour API calls

### Hook `useClientAuth()`
```javascript
const {
  user,                    // Current user data
  isAuthenticated,         // Auth status
  isLoading,               // Loading state
  error,                   // Error message
  login,                   // (email, password) => Promise
  logout,                  // () => void
  activate,                // (token, password) => Promise
  requestPasswordReset,    // (email) => Promise
  resetPassword,           // (token, password) => Promise
  getAuthHeader,           // () => { Authorization }
  authFetch               // (url, options) => Promise
} = useClientAuth();
```

### Endpoints Utilisés
| Endpoint | Description |
|----------|-------------|
| `POST /portal/login` | Connexion |
| `POST /portal/verify` | Vérification token |
| `POST /portal/activate` | Activation compte |
| `POST /portal/forgot-password` | Demande reset |
| `POST /portal/reset-password` | Reset password |

---

## 📄 PAGES

### LoginPage
- Formulaire email/password
- Mode "Mot de passe oublié"
- Message de succès
- Branding company configurable

**Props:**
```javascript
<LoginPage
  onLoginSuccess={() => {}}
  companyLogo="/logo.png"
  companyName="Nom Entreprise"
/>
```

### ActivationPage
- Validation token d'activation
- Création mot de passe
- Indicateur force password
- Requirements visuels

**Props:**
```javascript
<ActivationPage
  token="activation_token"
  onSuccess={() => {}}
  companyLogo="/logo.png"
  companyName="Nom Entreprise"
/>
```

### ResetPasswordPage
- Validation token reset
- Nouveau mot de passe
- Confirmation match
- Indicateur force

### ClientPortalDashboard
- **Vue d'ensemble:** Stats cards, actions requises
- **Onglet Devis:** Liste avec actions signature
- **Onglet Factures:** Component InvoicesList
- **Onglet Paiements:** Component PaymentHistory
- **Onglet Projets:** Component ProjectTimeline
- **Modals:** QuoteViewer, SignatureEmbed

---

## 🧩 COMPONENTS

### QuoteViewer
Affichage complet d'un devis client.

**Fonctionnalités:**
- Header avec numéro et statut
- Cards informations et montants
- Table détail prestations
- Section CGV avec checkbox acceptation
- Bouton signature

**Props:**
```javascript
<QuoteViewer
  quoteId={123}
  onSign={() => {}}
  onAcceptCGV={() => {}}
/>
```

### InvoicesList
Liste des factures avec filtres et actions.

**Fonctionnalités:**
- Cards résumé (total dû, en attente, en retard)
- Filtres: Toutes, En attente, Payées, En retard
- Table avec status badges
- Download PDF
- Bouton paiement

**Props:**
```javascript
<InvoicesList
  onSelectInvoice={(id) => {}}
  onPayInvoice={(invoice) => {}}
/>
```

### PaymentHistory
Historique des paiements avec timeline.

**Fonctionnalités:**
- Filtres période: Mois, Trimestre, Année, Tout
- Groupement par mois
- Icônes méthodes paiement
- Download reçu
- Stats résumé

### SignatureEmbed
Intégration iframe DocuSeal.

**Fonctionnalités:**
- Initialisation signature request
- Iframe DocuSeal
- Event listener postMessage
- Status tracking
- États: loading, ready, signing, completed, error

**Props:**
```javascript
<SignatureEmbed
  documentType="quote" // quote | cgv
  documentId={123}
  onComplete={(data) => {}}
  onCancel={() => {}}
  onError={(err) => {}}
/>
```

### ProjectTimeline
Suivi projet avec milestones.

**Fonctionnalités:**
- Progress bar global
- Circular progress indicator
- Timeline milestones avec status
- Icônes phases projet
- Liste documents projet

**Props:**
```javascript
<ProjectTimeline projectId={123} />
```

---

## 🚀 ClientPortalApp

### Routing
Gestion automatique des routes via URL params:

| URL | Vue |
|-----|-----|
| `/portal` | Login (si non auth) ou Dashboard |
| `/portal?action=activate&token=xxx` | ActivationPage |
| `/portal?action=reset&token=xxx` | ResetPasswordPage |

### Usage
```jsx
import { ClientPortalApp } from './portals/client';

function App() {
  return (
    <ClientPortalApp
      companyConfig={{
        name: 'Hypervisual',
        logo: '/logo-hypervisual.png'
      }}
    />
  );
}
```

---

## 🎨 UI/UX Features

### Design System
- Bootstrap 5 classes
- Cards avec shadows
- Responsive layout
- Status badges colorés
- Loading spinners
- Error alerts

### Formatage
- **Devises:** `Intl.NumberFormat('fr-CH')` CHF
- **Dates:** `toLocaleDateString('fr-CH')`
- **Status:** Badges colorés selon état

### Accessibilité
- Labels explicites
- ARIA attributes
- Focus management
- Keyboard navigation

---

## 📊 Résumé

| Type | Fichiers | Description |
|------|----------|-------------|
| Context | 1 | Auth state management |
| Pages | 4 | Login, Activation, Reset, Dashboard |
| Components | 5 | QuoteViewer, Invoices, Payments, Signature, Project |
| App | 2 | Main app + exports |
| **Total** | **12 fichiers** | Portail client complet |

---

## ✅ Fonctionnalités Couvertes

| Feature | Status |
|---------|--------|
| Authentification client | ✅ |
| Activation compte | ✅ |
| Reset password | ✅ |
| Dashboard multi-onglets | ✅ |
| Visualisation devis | ✅ |
| Acceptation CGV | ✅ |
| Signature électronique | ✅ |
| Liste factures | ✅ |
| Historique paiements | ✅ |
| Suivi projets | ✅ |

---

## ➡️ Prochaine Étape

**PARTIE 8:** Tests et Validation
- Tests unitaires services
- Tests API endpoints
- Validation workflow complet
- Documentation finale
