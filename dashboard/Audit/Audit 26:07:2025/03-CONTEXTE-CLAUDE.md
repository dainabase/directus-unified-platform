# 🤖 CONTEXTE-CLAUDE.md - Guide pour les Futures Sessions Claude

## 📌 À LIRE EN PREMIER
Ce document permet à toute nouvelle session Claude de reprendre le projet efficacement. Basé sur l'audit du 26/07/2025.

## 🎯 Résumé du Projet 

**Architecture** : Application web multi-rôles avec 4 espaces utilisateur distincts
**Stack** : HTML5 + Vanilla JS + Tabler.io + Notion API + Node.js/Express
**État** : 75% complet (Frontend 85%, Backend 70%, Tests 15%)
**Particularités** : Module OCR avec IA, multi-entités, interface française/suisse

## 🏗️ Architecture Réelle
```
/Users/jean-mariedelaunay/Dashboard Client: Presta/
├── portal-project/                    # Projet principal
│   ├── client/                       # 11 pages HTML
│   ├── prestataire/                  # 12 pages HTML
│   ├── revendeur/                    # 11 pages HTML
│   ├── superadmin/                   # 44 pages HTML (!!)
│   ├── assets/
│   │   ├── js/
│   │   │   ├── Core/                # 19 modules système
│   │   │   ├── Client/              # 12 modules
│   │   │   ├── Prestataire/         # 14 modules
│   │   │   ├── Revendeur/           # 10 modules
│   │   │   ├── Superadmin/          # 51 modules (!)
│   │   │   └── Optimizations/       # 5 modules
│   │   └── css/
│   ├── backend/                      # API Notion + routes
│   ├── server/                       # Services auth/users
│   └── ocr-service/                  # Service OCR dédié
├── Audit/                            # Documentation (ce dossier)
└── CLAUDE.md                         # Instructions permanentes
```

## 🚀 Comment Reprendre le Travail

### 1. Vérifier l'état actuel
```bash
# Se positionner dans le projet
cd "/Users/jean-mariedelaunay/Dashboard Client: Presta/portal-project"

# Vérifier les services backend
ls -la backend/server.js server/server.js ocr-service/

# Compter les modules par rôle
find assets/js -name "*.js" -type f | wc -l  # Should be ~174

# Vérifier les dernières modifications
ls -lt superadmin/finance/*.html | head -5  # OCR récemment modifié
```

### 2. Tester le système
```javascript
// Comptes de test dans localStorage
const testAccounts = {
  client: { email: "client@test.ch", password: "demo", role: "client" },
  prestataire: { email: "presta@test.ch", password: "demo", role: "prestataire" },
  revendeur: { email: "vendeur@test.ch", password: "demo", role: "revendeur" },
  superadmin: { email: "admin@test.ch", password: "demo", role: "superadmin" }
};

// Simuler connexion
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('userRole', 'superadmin');
```

### 3. Comprendre les flux
1. **Auth**: index.html → auth-notion.js → localStorage → redirect par rôle
2. **API Notion**: Module JS → notion-connector.js → Cache → Notion API
3. **OCR**: Upload → ocr-premium-interface.js → Tesseract/GPT-4 → Validation → Notion
4. **Permissions**: auth → permissions-notion.js → Cache 15min → Accès accordé/refusé

## ⚠️ Points d'Attention CRITIQUES

### 1. Fichiers à ne jamais modifier sans précaution
```
assets/js/Core/notion-connector.js     # Connecteur central - 32 DBs
assets/js/Core/auth-notion.js          # Auth système - touche tout
assets/js/Superadmin/accounting-engine.js  # Moteur comptable complexe
assets/js/Superadmin/ocr-notion-workflow.js # Workflow OCR critique
```

### 2. Ordre de chargement (ne pas changer!)
```html
<!-- Dans chaque page HTML -->
1. Tabler CSS
2. Custom CSS
3. Tabler JS
4. app.js
5. Module spécifique de la page
```

### 3. Conventions trouvées
- **Nommage**: `module-role.js` (ex: dashboard-client.js)
- **Cache**: 5min API, 15min permissions
- **Logs**: Console.log partout (1289!) - NE PAS AJOUTER
- **Async**: Promises > callbacks, pas d'async/await legacy

## 📝 Conventions de Code Détectées

### JavaScript
```javascript
// Pattern Module standard utilisé
const MonModule = {
    // Config
    CONSTANTS: { DB_ID: 'xxx' },
    cache: new Map(),
    
    // Init
    init() {
        console.log('🚀 Init MonModule'); // Emojis dans logs!
        this.attachEventListeners();
    },
    
    // Methods
    async fetchData() {
        // Check cache first
        if (this.cache.has(key)) return this.cache.get(key);
        // Fetch from Notion
        const data = await window.notionConnector.fetchDatabase(this.CONSTANTS.DB_ID);
        this.cache.set(key, data);
        return data;
    }
};

// Init au DOM ready
document.addEventListener('DOMContentLoaded', () => MonModule.init());
```

### HTML Structure
```html
<div class="page">
    <div class="page-wrapper">
        <div class="page-header d-print-none">
            <!-- Header content -->
        </div>
        <div class="page-body">
            <div class="container-xl">
                <!-- Main content -->
            </div>
        </div>
    </div>
</div>
```

## 🧪 Données de Test Identifiées

### Bases Notion de test
- Toutes les DBs dans `notion-connector.js` sont RÉELLES
- Pas de mode "dev" - ATTENTION aux modifications!

### Fichiers de test OCR
```
superadmin/finance/test-*.html      # Pages de test OCR
Test docs: HYPERVISUAL → PUBLIGRAMA  # Facture client
Test docs: PROMIDEA → HYPERVISUAL    # Facture fournisseur
```

### Entités du groupe (pour tests multi-entités)
- HYPERVISUAL, DAINAMICS, ENKI REALITY, TAKEOUT, LEXAIA

## 🔧 Commandes Utiles Vérifiées

```bash
# Backend principal (dossier portal-project)
cd backend && npm start  # Port 3001

# Service OCR
cd ocr-service && npm start  # Port 3002

# Serveur de test rapide
cd portal-project && python3 -m http.server 8080

# Recherche rapide
grep -r "TODO\|FIXME" assets/js --include="*.js"

# Trouver les gros fichiers
find . -name "*.js" -size +50k -exec ls -lh {} \;
```

## 🏃 Scénarios de Test Fonctionnels

### Test SuperAdmin OCR complet
1. Login admin@test.ch
2. Aller dans `/superadmin/finance/ocr-upload.html`
3. Upload facture PDF/image
4. Vérifier extraction automatique
5. Valider formulaire
6. Confirmer envoi Notion
7. Vérifier dans base Notion correspondante

### Test Pipeline Revendeur
1. Login vendeur@test.ch  
2. Aller dans `/revendeur/pipeline.html`
3. Drag & drop une carte entre colonnes
4. Vérifier mise à jour temps réel
5. Créer nouvelle opportunité
6. Convertir en client

## 🚨 Erreurs Courantes Anticipées

### "Cannot read property 'init' of undefined"
- Module pas chargé dans le bon ordre
- Vérifier ordre des scripts dans HTML

### "Notion API rate limit"
- Cache expiré + trop de requêtes
- Attendre 1 minute ou vider localStorage

### "OCR extraction failed"
- Document trop gros (>10MB)
- Format non supporté
- Vérifier logs console OCR

### Console errors au login
- Normal! Auth utilise try/catch pour redirect
- Si vraie erreur: vérifier localStorage corruption

## 📋 Checklist Avant Modification

- [ ] Backup du fichier original (.backup)
- [ ] Comprendre le module et ses dépendances
- [ ] Tester le flux actuel d'abord
- [ ] Vérifier impacts sur autres rôles
- [ ] Si SuperAdmin: EXTRA PRUDENCE
- [ ] Pas de console.log supplémentaires
- [ ] Respecter conventions existantes
- [ ] Tester sur tous les rôles après

## 🎯 Priorités Actuelles (basées sur l'audit)

1. **URGENT**: Sécuriser authentification (localStorage → JWT complet)
2. **URGENT**: Supprimer les 1289 console.log
3. **Important**: Tests modules critiques (auth, OCR, finance)
4. **Important**: Optimiser performance (bundles 86KB+)
5. **Normal**: Documentation API manquante

## 💡 Tips & Tricks Spécifiques

### Debug Notion API
```javascript
// Dans console browser
window.notionConnector.dataCache  // Voir cache actuel
window.notionConnector.clearCache() // Forcer refresh
```

### Test OCR rapide
```javascript
// Simuler extraction
window.OCRNotionWorkflow.detectDocumentType("HYPERVISUAL facture")
// Should return "FACTURE_CLIENT"
```

### Voir permissions actuelles
```javascript
window.PermissionsNotion.getCurrentUserPermissions()
```

### Changer de rôle sans logout
```javascript
localStorage.setItem('userRole', 'client'); location.reload();
```

## 📞 Ressources d'Aide

- **Tabler Docs**: https://preview.tabler.io/docs/
- **Notion API**: https://developers.notion.com/
- **Pattern Suisse**: Dans `swiss-patterns.js`
- **OCR Debug**: Pages test dans `/superadmin/finance/test-*.html`

## ⚡ Quick Start Personnalisé

```bash
# 1. Clone et setup
cd "/Users/jean-mariedelaunay/Dashboard Client: Presta"

# 2. Lancer un serveur local
cd portal-project && python3 -m http.server 8080

# 3. Ouvrir navigateur
open http://localhost:8080

# 4. Login SuperAdmin pour voir tout
# Email: admin@test.ch, Password: demo

# 5. Tester OCR (le plus complexe)
# Aller dans SuperAdmin > Finance > OCR Upload
```

## 🔴 FOCUS SUPERADMIN - Guide Spécial

### Architecture SuperAdmin
- **44 pages** (!!) - 40% du projet
- **51 modules JS** - Très interconnectés
- **OCR Premium**: 23 fichiers - Coeur métier
- **Finance**: Comptabilité multi-entités complexe

### Précautions SuperAdmin
1. **Ne jamais** modifier accounting-engine.js sans comprendre
2. **Toujours** tester OCR sur les 4 types de documents
3. **Vérifier** les permissions avant ajout fonctionnalité
4. **Logger** toute action sensible dans audit log

### Tests SuperAdmin spécifiques
```bash
# Test OCR complet
open superadmin/finance/test-facture-client-detection.html

# Test multi-entités  
open superadmin/finance/test-multi-entities.html

# Test permissions admin
localStorage.setItem('userRole', 'client');
# Essayer accéder /superadmin/* = redirect!
```

### Erreurs fréquentes SuperAdmin
- "Entity not found" = Mauvaise config multi-entités
- "OCR timeout" = Document >10MB ou réseau lent  
- "Permission denied" = Cache permissions corrompu
- "Duplicate entry" = Race condition Notion API

---
*Guide généré le 26/07/2025 - À mettre à jour après changements majeurs*