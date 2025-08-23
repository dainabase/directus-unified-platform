# 🚀 OCR Module - Quick Start Guide

## 📍 TL;DR - Utilisation Immédiate

```bash
# 1. Aller dans le module
cd src/frontend/modules/ocr/v10-official

# 2. Ouvrir le dashboard
open index.html
```

C'est tout ! Le module est prêt à l'emploi.

## 🎯 Accès Direct aux Ressources

| Ressource | Chemin | Description |
|-----------|--------|-------------|
| **Dashboard OCR** | `v10-official/index.html` | Point d'entrée principal |
| **Config Bases** | `config/databases.json` | 6 bases Notion configurées |
| **Config Templates** | `config/templates.json` | 6 templates de documents |
| **Documentation** | `README.md` | Guide complet |
| **Tests** | `tests/` | Tests unitaires |

## ⚡ Commandes Rapides

### Développement Local
```bash
# Option 1: Ouvrir directement
open src/frontend/modules/ocr/v10-official/index.html

# Option 2: Avec serveur Python
cd src/frontend/modules/ocr
python -m http.server 8000
# Puis ouvrir http://localhost:8000/v10-official/

# Option 3: Avec Node.js
npx serve src/frontend/modules/ocr
```

### Migration Complète (si pas encore fait)
```bash
# Exécuter le script de migration
chmod +x scripts/migrate-ocr-module.sh
./scripts/migrate-ocr-module.sh
```

### Configuration
```bash
# Copier et configurer les variables d'environnement
cp src/frontend/modules/ocr/.env.example src/frontend/modules/ocr/.env
# Éditer le fichier .env avec vos clés API
```

## 🔌 Intégration React

### Import Simple
```jsx
// Dans votre composant React
import OCRDashboard from './modules/ocr/v10-official';

function App() {
    return <OCRDashboard />;
}
```

### Via iFrame
```jsx
function App() {
    return (
        <iframe 
            src="/modules/ocr/v10-official/index.html"
            width="100%"
            height="800px"
            frameBorder="0"
        />
    );
}
```

## 📊 Structure du Module

```
ocr/
├── 📄 README.md          → Documentation complète
├── 🚀 QUICK_START.md     → Ce fichier
├── 📊 ORGANIZATION_STATUS.md → État de l'organisation
│
├── v10-official/         → VERSION OFFICIELLE ✅
│   └── index.html       → Point d'entrée
│
├── config/              → Configurations
│   ├── databases.json   → 6 bases Notion
│   └── templates.json   → 6 templates
│
├── tests/               → Tests
└── docs/                → Documentation
```

## 🎨 Templates Disponibles

1. **Facture Client** 📄
2. **Facture Fournisseur** 📥
3. **Note de Frais** 💳
4. **Contrat** 📋
5. **Relevé Bancaire** 🏦
6. **Document Général** 📎

## 🔑 Clés API Nécessaires

| Service | Variable | Où l'obtenir |
|---------|----------|--------------|
| OpenAI | `VITE_OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Notion | `VITE_NOTION_API_KEY` | [notion.so/my-integrations](https://www.notion.so/my-integrations) |
| Directus | `VITE_DIRECTUS_TOKEN` | Admin Directus → Settings → Access Tokens |

## 🧪 Tests Rapides

```bash
# Test unitaire
open src/frontend/modules/ocr/tests/test-ocr-final.html

# Test complet
open src/frontend/modules/ocr/tests/test-ocr-complete.html
```

## 💡 Tips & Tricks

### Debug Mode
```javascript
// Dans la console du navigateur
localStorage.setItem('ocr_debug', 'true');
```

### Changer la langue
```javascript
// Dans config/templates.json
"settings": {
    "languages": ["fr", "en", "de", "it"]
}
```

### Multi-entreprises
```javascript
// Les 5 entreprises sont configurées
// HYPERVISUAL, DAINAMICS, LEXAIA, ENKI REALTY, TAKEOUT
```

## 🆘 Problèmes Fréquents

### "Erreur API OpenAI"
→ Vérifier la clé API dans .env

### "Cannot connect to Notion"
→ Vérifier les IDs des bases dans config/databases.json

### "Directus unreachable"
→ Vérifier que Directus tourne sur localhost:8055

## 📞 Support

- **Documentation** : `README.md`
- **Status** : `ORGANIZATION_STATUS.md`
- **GitHub** : [directus-unified-platform](https://github.com/dainabase/directus-unified-platform)

---

*OCR Premium Dashboard v10 - Ready to Use! 🚀*
