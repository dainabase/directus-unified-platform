# 🤖 CONTEXTE-CLAUDE.md - Guide pour les Futures Sessions Claude

## 📌 À LIRE EN PREMIER
Ce document est conçu pour permettre à toute nouvelle session Claude de comprendre et reprendre le projet rapidement.

## 🎯 Résumé du Projet en 30 Secondes

**Quoi** : Dashboard multi-rôle (Client/Prestataire/Revendeur) connecté à 17 bases Notion  
**Stack** : HTML + Vanilla JS + Tabler.io + CDN libs (pas de framework)  
**État** : Interface 100% complete, données mockées, prêt pour migration Notion  
**Particularité** : Architecture modulaire, cache intelligent, permissions granulaires  

## 🏗️ Architecture Globale

```
portal-project/
├── client/          → 8 pages HTML (dashboard, projets, docs, finances...)
├── prestataire/     → 10 pages HTML (missions, rewards, calendar...)  
├── revendeur/       → 8 pages HTML (pipeline, leads, rapports...)
├── assets/js/
│   ├── notion-connector.js      → HUB central (17 DB IDs)
│   ├── auth-notion.js          → Auth + sessions
│   ├── chat-notion.js          → Chat temps réel
│   ├── permissions-notion.js    → Contrôle accès
│   └── *-notion.js             → Modules spécifiques
```

## 🚀 Comment Reprendre le Travail

### 1. Vérifier l'état actuel
```bash
# Lire les fichiers de documentation
1. AUDIT-INFRASTRUCTURE.md    → État technique complet
2. COMPTE-RENDU-TRAVAIL.md   → Historique du développement  
3. TODO-TESTS-MAINTENANCE.md  → Ce qui reste à faire
4. CLAUDE.md                  → Instructions originales
```

### 2. Tester avant de modifier
```javascript
// Comptes de test disponibles
client@demo.ch / demo123       → Rôle Client
prestataire@demo.ch / demo123  → Rôle Prestataire  
revendeur@demo.ch / demo123    → Rôle Revendeur
```

### 3. Comprendre les flux
1. **Auth** : login.html → auth-notion.js → localStorage → redirect
2. **Data** : Page HTML → module JS → notion-connector → cache → UI
3. **Perms** : Action → permissions-notion.js → check → allow/deny → audit

## ⚠️ Points d'Attention CRITIQUES

### 1. Ne JAMAIS modifier sans backup
```javascript
// TOUJOURS faire ça avant de modifier notion-connector.js
cp notion-connector.js notion-connector.backup.js
```

### 2. Ordre de chargement des scripts
```html
<!-- Dans TOUS les HTML, respecter cet ordre -->
<script src="../assets/js/notion-connector.js"></script>
<script src="../assets/js/auth-notion.js"></script>
<script src="../assets/js/[module-specifique].js"></script>
```

### 3. Format Swiss obligatoire
```javascript
// TOUJOURS utiliser pour les montants
formatSwissAmount(1234.56) // → "1'234.56"
// Jamais de virgule, toujours apostrophe
```

### 4. Cache à respecter
- Default : 5 minutes
- Permissions : 15 minutes  
- Chat : PAS de cache
- Ne pas modifier sans comprendre l'impact

## 📝 Conventions de Code

### Structure d'un module
```javascript
const ModuleNotion = {
    // Configuration
    DB_IDS: { ... },
    CACHE_DURATION: 5 * 60 * 1000,
    
    // État
    cache: new Map(),
    
    // Méthodes
    async init() { },
    async loadData() { },
    renderUI() { },
    
    // Utilitaires
    formatData() { },
    handleError() { }
};
```

### Gestion d'erreurs
```javascript
try {
    const data = await NotionConnector.getData();
    this.renderData(data);
} catch (error) {
    console.error('Erreur:', error);
    window.showNotification?.('Erreur de chargement', 'error');
    // TOUJOURS un fallback
    this.renderEmptyState();
}
```

### Nommage
- Modules : `[fonction]-notion.js`
- Fonctions : `camelCase`
- IDs HTML : `kebab-case`
- Classes CSS : `.role-[role]`

## 🧪 Données de Test

### Structure utilisateur type
```javascript
{
    id: "usr_001",
    name: "Jean Dupont",
    email: "jean@example.ch",
    role: "client",
    avatar: "JD"
}
```

### Structure projet type
```javascript
{
    id: "prj_001",
    name: "Refonte Site Web",
    status: "en_cours",
    progress: 65,
    budget: 45000,
    client: "TechCorp SA"
}
```

### IDs de test utiles
- Projet actif : `prj_001`
- Mission urgente : `mis_urgent_001`
- Deal pipeline : `deal_001`

## 🔧 Commandes Utiles

### Pour développer
```bash
# Serveur local (depuis le dossier portal-project)
python3 -m http.server 8000
# Accès : http://localhost:8000/login.html

# Watcher pour les changements
# fswatch -o . | xargs -n1 -I{} date
```

### Pour debugger
```javascript
// Dans la console browser
localStorage.clear() // Reset session
NotionConnector.cache.clear() // Vider cache
ChatNotion.init() // Relancer chat
PermissionsNotion.getCurrentUserPermissions() // Voir perms
```

## 🏃 Scénarios de Test Recommandés

### 1. Flow Client Complet
1. Login comme client@demo.ch
2. Vérifier dashboard (4 KPIs)
3. Créer un projet
4. Uploader document
5. Consulter facture
6. Utiliser chat

### 2. Flow Prestataire  
1. Login comme prestataire@demo.ch
2. Vérifier missions assignées
3. Compléter une tâche
4. Vérifier rewards/niveau
5. Consulter calendrier

### 3. Flow Revendeur
1. Login comme revendeur@demo.ch  
2. Vérifier pipeline kanban
3. Drag & drop un deal
4. Créer un lead
5. Générer rapport

## 🚨 Erreurs Courantes et Solutions

### "Cannot read property 'init' of undefined"
→ Scripts pas chargés dans le bon ordre

### "Cache is not defined"  
→ notion-connector.js pas chargé

### "Unauthorized access"
→ Vérifier localStorage contient session

### Chat ne se charge pas
→ Attendre NotionConnector ET AuthNotionModule

## 📋 Checklist Avant Modification Majeure

- [ ] Backup des fichiers critiques
- [ ] Tester fonctionnalité actuelle  
- [ ] Comprendre le flux de données
- [ ] Vérifier les dépendances
- [ ] Documenter les changements
- [ ] Tester les 3 rôles
- [ ] Vérifier le cache
- [ ] Tester sur mobile

## 🎯 Priorités si Reprise du Projet

1. **URGENT** : Sécuriser l'authentification (JWT)
2. **IMPORTANT** : Implémenter timetracking-notion.js  
3. **IMPORTANT** : Migrer vers vraies données Notion
4. **NORMAL** : Ajouter tests automatisés
5. **NICE TO HAVE** : Mode offline complet

## 💡 Tips & Tricks

1. **Performance** : Le cache fait 80% du travail
2. **UX** : Toujours un spinner pendant chargement
3. **Debug** : Console logs déjà en place, les activer
4. **Mobile** : Tester avec Chrome DevTools
5. **Notion** : Les IDs sont dans notion-connector.js

## 📞 Si Besoin d'Aide

1. Vérifier CLAUDE.md pour contexte original
2. Lire les commentaires dans le code
3. Chercher les TODO: dans le code
4. Les mock data montrent la structure attendue

## ⚡ Quick Start Modification

```javascript
// Pour ajouter une nouvelle fonctionnalité
1. Créer [feature]-notion.js dans assets/js/
2. Copier structure d'un module existant
3. Ajouter dans notion-connector.js si besoin
4. Inclure dans les HTML concernés
5. Tester avec les 3 rôles
6. Documenter dans ce fichier
```

---

💪 **Bonne chance pour la suite du projet !**

*PS: Le code est bien structuré et documenté, tu devrais t'y retrouver facilement.*