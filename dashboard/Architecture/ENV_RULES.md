# 🔐 ENV RULES - Règles de Configuration

Ce fichier définit les règles CRITIQUES pour la gestion des configurations et variables d'environnement du projet Dashboard Client: Presta.

## ⚠️ RÈGLES ABSOLUES

### 1. **JAMAIS de secrets dans le code**
- ❌ Pas de tokens Notion dans les fichiers JS
- ❌ Pas de clés API en dur
- ❌ Pas de mots de passe dans le code
- ✅ Utiliser le proxy serveur pour les appels API

### 2. **Modification des configurations**
- ❌ JAMAIS utiliser `Write` sur les fichiers de config existants
- ✅ TOUJOURS utiliser `Edit` pour modifier
- ✅ TOUJOURS faire un backup avant modification majeure

### 3. **Database IDs Notion**
- ❌ JAMAIS modifier les IDs existants sans vérification
- ✅ TOUJOURS vérifier dans Notion que l'ID est correct
- ✅ Utiliser le format UUID complet (avec tirets)

## 📋 Fichiers de configuration

### 1. **Configuration Notion** (`/api/config-notion.php`)
```php
// Structure requise
$config = [
    'notion_api_key' => getenv('NOTION_API_KEY'), // Via variable d'environnement
    'databases' => [
        'users' => 'uuid-complet-avec-tirets',
        'projects' => 'uuid-complet-avec-tirets',
        // ...
    ]
];
```

### 2. **Configuration Serveur** (`/server/.env`)
```bash
# Format requis
NODE_ENV=development|production
PORT=3000
NOTION_API_KEY=secret_xxxxx  # NE JAMAIS commiter
ENABLE_CACHE=true
CACHE_TTL=3600
```

### 3. **Configuration Frontend** (`/assets/js/Core/entities-config.js`)
```javascript
// Configuration multi-entités
window.ENTITIES_CONFIG = {
    entities: {
        'entity-uuid': {
            name: 'Nom Entité',
            databases: {
                // Mapping des bases par entité
            }
        }
    }
};
```

## 🔒 Variables protégées

Ces variables NE DOIVENT JAMAIS être modifiées sans autorisation :

### Niveau CRITIQUE
- `NOTION_API_KEY` - Token d'authentification Notion
- `NOTION_VERSION` - Version de l'API Notion (2022-06-28)
- `SUPERADMIN_ACCESS_KEY` - Clé d'accès superadmin

### Niveau IMPORTANT
- `SESSION_SECRET` - Secret pour les sessions
- `JWT_SECRET` - Secret pour les tokens JWT
- `ENCRYPTION_KEY` - Clé de chiffrement

### Niveau STANDARD
- `API_RATE_LIMIT` - Limite de requêtes (3/sec)
- `CACHE_ENABLED` - Activation du cache
- `LOG_LEVEL` - Niveau de logging

## 🛠️ Workflow de modification

### Pour ajouter une nouvelle variable :

1. **Vérifier la nécessité**
   - La variable est-elle vraiment nécessaire ?
   - Peut-on utiliser une config existante ?

2. **Choisir le bon emplacement**
   - Secret → `.env` (jamais dans le code)
   - Config publique → fichier de config approprié

3. **Documenter**
   ```bash
   # Ajouter dans le fichier .env.example
   NEW_VARIABLE=example_value # Description de la variable
   ```

4. **Mettre à jour ce fichier**
   - Ajouter la variable dans la section appropriée
   - Documenter son usage

### Pour modifier une variable existante :

1. **Impact analysis**
   ```bash
   # Rechercher tous les usages
   grep -r "VARIABLE_NAME" .
   ```

2. **Test en local**
   - Modifier dans `.env.local` d'abord
   - Tester tous les modules affectés

3. **Migration progressive**
   - Garder l'ancienne variable
   - Ajouter la nouvelle
   - Migrer progressivement
   - Supprimer l'ancienne après validation

## 📁 Structure des fichiers de configuration

```
portal-project/
├── .env.example          # Template pour développeurs
├── .env                  # Variables locales (ignoré par git)
├── api/
│   └── config-notion.php # Config PHP pour proxy Notion
├── server/
│   ├── .env             # Variables serveur Node.js
│   └── config/
│       └── databases.js # Mapping des databases
└── assets/js/
    └── Core/
        ├── entities-config.js    # Config multi-entités
        └── superadmin-databases-config.js # Config superadmin
```

## 🚨 Sécurité

### Checklist de sécurité
- [ ] Jamais de secrets dans le code source
- [ ] Utiliser HTTPS en production
- [ ] Rotation régulière des tokens
- [ ] Logs sans informations sensibles
- [ ] Variables d'environnement pour tous les secrets

### Audit de configuration
```bash
# Vérifier qu'aucun secret n'est exposé
npm run audit:config

# Scanner les fichiers pour des secrets
npm run scan:secrets
```

## 📊 Variables par environnement

### Development
```bash
NODE_ENV=development
API_URL=http://localhost:3000
ENABLE_DEBUG=true
LOG_LEVEL=debug
```

### Staging
```bash
NODE_ENV=staging
API_URL=https://staging.dashboard-presta.ch
ENABLE_DEBUG=false
LOG_LEVEL=info
```

### Production
```bash
NODE_ENV=production
API_URL=https://api.dashboard-presta.ch
ENABLE_DEBUG=false
LOG_LEVEL=error
ENABLE_MONITORING=true
```

## 🔄 Validation automatique

Un script vérifie la conformité des configurations :

```bash
npm run validate:config
```

Ce script vérifie :
- ✅ Présence des variables requises
- ✅ Format des valeurs
- ✅ Absence de secrets dans le code
- ✅ Cohérence entre environnements

## 📝 Historique des changements

### Janvier 2025
- Migration vers Notion API v2
- Ajout support multi-entités

### Décembre 2024
- Ajout configuration OCR
- Sécurisation des tokens

### Novembre 2024
- Configuration initiale
- Setup proxy Notion

---

**⚠️ RAPPEL** : Toute modification de configuration doit être testée sur TOUS les environnements et TOUS les rôles avant déploiement.