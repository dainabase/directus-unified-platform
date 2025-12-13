# 🏗️ Architecture Technique - Directus Unified Platform

## Vue d'Ensemble

Cette plateforme est conçue selon une architecture **multi-tiers** avec séparation claire des responsabilités.

## 🎯 Principes d'Architecture

### 1. Separation of Concerns
- **Frontend** : Présentation et interaction utilisateur
- **Backend** : Logique métier et API
- **Database** : Persistance des données
- **Integrations** : Services externes

### 2. Scalabilité
- Architecture **horizontalement scalable**
- Load balancing natif
- Cache multi-niveaux (Redis + CDN)
- Database pooling

### 3. Sécurité
- **Zero Trust Architecture**
- Authentification OAuth 2.0
- Encryption at rest & in transit
- API rate limiting

## 📊 Architecture Système

```
┌──────────────────────────────────────────────────────────┐
│                     CDN (CloudFlare)                      │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  LOAD BALANCER (Nginx)                    │
└────────────────────┬─────────────────────────────────────┘
                     │
     ┌───────────────┴────────────┬────────────┐
     │                            │            │
┌────▼────────┐    ┌─────────────▼──┐    ┌────▼──────────┐
│ Frontend (1) │    │ Frontend (2)   │    │ Frontend (N)  │
│  React/Vite  │    │  React/Vite    │    │  React/Vite   │
└────┬────────┘    └─────────┬──────┘    └────┬──────────┘
     │                       │                  │
     └───────────────────────┼──────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                    API GATEWAY (Kong)                     │
└────────────────────────────┬─────────────────────────────┘
                             │
     ┌───────────────────────┼────────────────┐
     │                       │                │
┌────▼────────┐    ┌─────────▼──────┐    ┌────▼──────────┐
│ Directus (1) │    │ Directus (2)   │    │ Directus (N)  │
│ Backend API  │    │ Backend API    │    │ Backend API   │
└────┬────────┘    └─────────┬──────┘    └────┬──────────┘
     │                       │                 │
     └───────────────────────┼─────────────────┘
                             │
     ┌───────────────────────┼────────────────┐
     │                       │                │
┌────▼────────┐    ┌─────────▼──────┐    ┌────▼─────┐
│ PostgreSQL  │    │    Redis       │    │   S3     │
│   Primary   │    │    Cache       │    │ Storage  │
└─────────────┘    └────────────────┘    └──────────┘
```

## 🔌 Intégrations Externes

### Invoice Ninja
- **Version** : v5
- **Protocol** : REST API
- **Auth** : API Key
- **Usage** : Facturation complète

### Revolut Business
- **Version** : API v2
- **Protocol** : REST + OAuth2
- **Auth** : JWT RS256
- **Usage** : Banking & Paiements

### ERPNext
- **Version** : v15
- **Protocol** : REST + WebSocket
- **Auth** : Token Bearer
- **Usage** : ERP complet

### Mautic
- **Version** : 5.x
- **Protocol** : REST API
- **Auth** : OAuth2
- **Usage** : Marketing Automation

### OpenAI Vision
- **Version** : Latest
- **Protocol** : REST API
- **Auth** : Bearer Token
- **Usage** : OCR Documents

## 📁 Structure des Modules

### Frontend Structure
```
/frontend/
├── /src/
│   ├── /portals/          # 4 portails distincts
│   │   ├── /superadmin/   # Dashboard CEO
│   │   ├── /client/       # Portail clients
│   │   ├── /prestataire/  # Portail prestataires
│   │   └── /revendeur/    # Portail revendeurs
│   ├── /components/       # Composants partagés
│   ├── /services/         # Services API
│   ├── /hooks/           # React hooks
│   ├── /utils/           # Utilitaires
│   └── /store/           # State management
```

### Backend Structure
```
/backend/
├── /api/                  # Endpoints custom
│   ├── /ocr/             # OCR Service
│   ├── /revolut/         # Banking API
│   └── /webhooks/        # Webhooks handlers
├── /collections/          # 62 Collections Directus
├── /extensions/          # Extensions Directus
│   ├── /endpoints/       # 156 endpoints custom
│   ├── /hooks/          # Automatisations
│   └── /modules/        # Modules UI
└── /database/           # Migrations & Seeds
```

## 🔐 Sécurité

### Authentification
- **OAuth 2.0** avec PKCE
- **JWT** avec rotation automatique
- **2FA** optionnel
- **SSO** pour entreprises

### Autorisation
- **RBAC** (Role-Based Access Control)
- **Permissions granulaires**
- **Row-level security**
- **API scopes**

### Protection
- **Rate limiting** : 100 req/min
- **DDoS protection** : CloudFlare
- **WAF** : ModSecurity
- **CORS** : Whitelist strict

## 📈 Performance

### Optimisations Frontend
- **Code splitting** automatique
- **Lazy loading** des modules
- **Virtual scrolling** pour listes
- **Service Workers** pour offline
- **CDN** pour assets statiques

### Optimisations Backend
- **Query optimization** avec indexes
- **Connection pooling** PostgreSQL
- **Redis caching** multi-niveaux
- **Batch processing** pour imports
- **Async job queues** avec BullMQ

### Métriques Cibles
- **TTFB** : < 200ms
- **FCP** : < 1.5s
- **TTI** : < 3.5s
- **API Response** : < 100ms (p95)
- **Uptime** : 99.9%

## 🚀 Déploiement

### Environnements
1. **Development** : Local Docker
2. **Staging** : AWS ECS
3. **Production** : AWS EKS

### CI/CD Pipeline
```
Code Push → GitHub Actions → Tests → Build → Deploy → Monitor
```

### Monitoring
- **APM** : New Relic
- **Logs** : ELK Stack
- **Metrics** : Prometheus + Grafana
- **Errors** : Sentry
- **Uptime** : UptimeRobot

## 📊 Base de Données

### Collections Principales (62 total)
- `companies` - Gestion multi-entreprises
- `contacts` - Contacts unifiés
- `projects` - Projets et tâches
- `deliverables` - Livrables
- `client_invoices` - Factures clients
- `supplier_invoices` - Factures fournisseurs
- `payments` - Paiements
- `bank_transactions` - Transactions bancaires
- ... (54 autres collections)

### Relations
- **105 relations** définies
- Foreign keys avec CASCADE
- Indexes optimisés
- Contraintes d'intégrité

## 🔄 Workflows

### Synchronisation
- **Temps réel** via WebSockets
- **Webhooks** bidirectionnels
- **Event sourcing** pour audit
- **CQRS** pour performances

### Automatisations
- **n8n** pour workflows complexes
- **Directus Flows** pour simple
- **Cron jobs** pour scheduled tasks
- **Queue workers** pour async

## 📝 Standards & Conventions

### Code Style
- **ESLint** + **Prettier**
- **Conventional Commits**
- **Semantic Versioning**
- **JSDoc** documentation

### Git Workflow
- **GitFlow** branching model
- **PR reviews** obligatoires
- **CI checks** avant merge
- **Semantic release** auto

## 🧪 Testing Strategy

### Frontend
- **Unit** : Jest + React Testing Library
- **Integration** : Cypress
- **E2E** : Playwright
- **Visual** : Percy

### Backend
- **Unit** : Jest
- **Integration** : Supertest
- **API** : Postman/Newman
- **Load** : K6

### Coverage Targets
- **Unit** : 80%
- **Integration** : 60%
- **E2E** : Critical paths

---

*Architecture maintenue et évolutive selon les besoins business*