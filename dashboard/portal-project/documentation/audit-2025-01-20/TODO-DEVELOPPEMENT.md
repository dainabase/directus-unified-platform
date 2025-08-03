# TODO - Dashboard Multi-Rôles
*Date : 20 Janvier 2025*

## 🔴 CRITIQUE - À faire immédiatement

### Migration vers Production
- [ ] **Activer auth-notion-v2.js** en production
  - Remplacer auth-notion.js dans tous les HTML
  - Tester le flow JWT complet
  - Migrer les sessions existantes
  
- [ ] **Connecter les vraies bases Notion**
  - Créer les 15+ bases dans Notion
  - Configurer les clés API dans .env
  - Tester chaque endpoint
  - Valider les permissions

- [ ] **Sécuriser les mots de passe**
  - Implémenter bcrypt côté serveur
  - Migrer les users de démo
  - Forcer changement au premier login

### Performance Production
- [ ] **Configurer Webpack**
  - Créer webpack.config.js complet
  - Bundle par rôle (client.js, prestataire.js, revendeur.js)
  - Tree shaking agressif
  - Code splitting automatique

- [ ] **Activer compression**
  - Gzip/Brotli sur Nginx
  - Minification HTML/CSS/JS
  - Images WebP avec fallback
  - Critical CSS inline

## 🟠 IMPORTANT - Prochaine phase

### Sécurité
- [ ] **Audit de sécurité complet**
  - Test injection SQL/NoSQL
  - Test XSS sur tous les inputs
  - Vérifier CSRF tokens
  - Scanner avec OWASP ZAP

- [ ] **Renforcer CSP headers**
  ```javascript
  // À ajouter dans server.js
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }));
  ```

- [ ] **Implémenter 2FA**
  - TOTP avec QR code
  - SMS backup (Twilio)
  - Recovery codes

### Tests fonctionnels
- [ ] **Tests end-to-end avec Playwright**
  ```javascript
  // tests/e2e/auth.spec.js
  test('Multi-role login flow', async ({ page }) => {
    await page.goto('/login.html');
    await page.fill('#email', 'test@client.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/client/dashboard.html');
  });
  ```

- [ ] **Tests API avec Jest**
  - Auth endpoints
  - Permissions middleware
  - Rate limiting
  - Error handling

- [ ] **Tests responsive tous devices**
  - iPhone SE → iPhone 14 Pro Max
  - iPad Mini → iPad Pro
  - Desktop 1366x768 → 4K

### Performance
- [ ] **Optimiser chargement images**
  - Lazy loading natif (`loading="lazy"`)
  - Srcset responsive
  - Conversion WebP automatique
  - CDN images (Cloudinary)

- [ ] **Implémenter Service Worker v2**
  ```javascript
  // sw-v2.js
  self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
      // Network first, cache fallback
    } else {
      // Cache first, network fallback
    }
  });
  ```

- [ ] **Monitoring performance**
  - Google Analytics 4
  - Web Vitals tracking
  - Sentry performance
  - Custom metrics

## 🟡 NORMAL - Développement continu

### Espace Client
- [ ] **Export projets en PDF**
  - Template professionnel
  - Logo entreprise
  - Graphiques inclus

- [ ] **Notifications email**
  - Nouveau document
  - Facture due
  - Projet mis à jour

- [ ] **Signatures électroniques**
  - Intégration DocuSign/HelloSign
  - Workflow validation

### Espace Prestataire
- [ ] **Intégration calendrier externe**
  - Google Calendar sync
  - Outlook sync
  - iCal export

- [ ] **Time tracking mobile**
  - PWA dédiée
  - Géolocalisation
  - Mode offline

- [ ] **Tableau de bord TV**
  - Mode kiosque
  - Refresh auto
  - Métriques équipe

### Espace Revendeur
- [ ] **Import/Export en masse**
  - CSV/Excel pour leads
  - Template standardisé
  - Validation données

- [ ] **Automatisations**
  - Email sequences
  - Lead scoring auto
  - Assignation intelligente

- [ ] **Intégrations CRM**
  - Webhooks sortants
  - API REST publique
  - Zapier/Make.com

## 🟢 NICE TO HAVE - Améliorations futures

### UX/UI
- [ ] **Mode sombre complet**
  - Toggle dans navbar
  - Préférence système
  - Transitions smooth

- [ ] **Thèmes personnalisables**
  - Couleurs entreprise
  - Logo dans sidebar
  - CSS variables

- [ ] **Onboarding interactif**
  - Tour guidé (Intro.js)
  - Tooltips contextuels
  - Vidéos tutoriels

### Features avancées
- [ ] **IA/ML intégration**
  - Prédiction churn
  - Suggestions actions
  - Chatbot support

- [ ] **App mobile native**
  - React Native
  - Notifications push
  - Biométrie

- [ ] **Blockchain**
  - Smart contracts
  - Audit trail immutable
  - Crypto payments

### Technique
- [ ] **Migration TypeScript**
  - Types stricts
  - Interfaces API
  - Better IntelliSense

- [ ] **GraphQL API**
  - Remplacer REST
  - Subscriptions real-time
  - Query optimization

- [ ] **Microservices**
  - Auth service
  - Notification service
  - Analytics service

## 📝 MODIFICATIONS TEMPORAIRES À REVERTER

### ⚠️ AUCUNE MODIFICATION TEMPORAIRE EFFECTUÉE
Tous les fichiers sont dans leur état final de développement.

## 🐛 BUGS CONNUS

### Priorité HAUTE
1. **Pipeline Kanban** : Drag & drop peut fail sur double-click rapide
   - Fichier : `pipeline-notion.js` ligne 287-335
   - Fix : Debounce les events dragstart

2. **Upload gros fichiers** : Progress bar freeze >50MB
   - Fichier : `documents-notion.js` ligne 445
   - Fix : Web Workers pour upload

### Priorité MOYENNE
1. **Calendar** : Events peuvent se chevaucher visuellement
   - Fichier : `calendar-notion.js`
   - Fix : Ajuster l'algo de placement

2. **Recherche** : Sensible à la casse
   - Multiple fichiers
   - Fix : toLowerCase() partout

### Priorité BASSE
1. **Animations** : Saccades sur vieux Android
   - Fix : Désactiver si `prefers-reduced-motion`

2. **Print** : Graphiques pas toujours visibles
   - Fix : CSS print spécifique

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- [ ] Lighthouse Score > 90
- [ ] FCP < 1.5s
- [ ] TTI < 3.5s
- [ ] CLS < 0.1

### Business
- [ ] 0 erreurs critiques en prod
- [ ] <2% bounce rate
- [ ] >80% satisfaction users
- [ ] <24h résolution bugs

### Technique
- [ ] Test coverage > 80%
- [ ] 0 vulnérabilités high/critical
- [ ] Bundle size < 500KB gzipped
- [ ] API response time < 200ms

## 🚀 ORDRE DE PRIORITÉ RECOMMANDÉ

1. **Semaine 1** : Migration production (auth v2 + Notion API)
2. **Semaine 2** : Webpack + optimisations + tests
3. **Semaine 3** : Sécurité + monitoring
4. **Semaine 4** : Bugs + polish + deploy
5. **Mois 2** : Features client priority
6. **Mois 3** : Mobile + intégrations

---

*Note : Cette TODO list est vivante et doit être mise à jour régulièrement. Utiliser les labels GitHub Issues pour tracker.*