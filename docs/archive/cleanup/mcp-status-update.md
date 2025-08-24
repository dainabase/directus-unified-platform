# 🎯 MISE À JOUR STATUS MCP

## ✅ Corrections Effectuées

### 1. **Notion** ✅ CORRIGÉ
- ~~Ancienne clé~~ : `secret_A93L...mBmf` (invalide)
- **Nouvelle clé** : `ntn_3971...herAm4L8` 
- **Status** : ✅ Authentification réussie !

### 2. **Configuration Nettoyée**
- ❌ Supprimé `directus` MCP (trop complexe)
- ❌ Supprimé `mcp-installer` (non nécessaire)
- ✅ Configuration simplifiée à 6 MCP

## 📊 État Actuel des MCP

| MCP | Status | Action Requise |
|-----|---------|----------------|
| **GitHub** | ❌ Token invalide | Générer nouveau token |
| **Notion** | ✅ FONCTIONNEL | Aucune |
| **Filesystem** | ✅ Fonctionnel | Aucune |
| **ERPNext** | ✅ Fonctionnel | Aucune |
| **Memory** | ✅ Fonctionnel | Aucune |
| **Puppeteer** | ✅ Fonctionnel | Aucune |

**Score : 5/6 MCP fonctionnels (83%)**

## 🔧 Dernière Action Requise

### Générer Nouveau Token GitHub

1. Aller sur : https://github.com/settings/tokens/new
2. **Token name** : "Claude Desktop MCP"
3. **Expiration** : 90 days
4. **Permissions** :
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
   - ✅ `read:org` (Read org and team membership)
   - ✅ `gist` (Create gists)

5. Copier le token (format : `ghp_xxxxxxxxxx`)

### Mettre à Jour le Token

```bash
# Remplacer YOUR_NEW_TOKEN par le token copié
NEW_TOKEN="ghp_YOUR_NEW_TOKEN_HERE"

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Mise à jour
sed -i '' "s/ghp_ZUBvhZnxHMZlMUvw4jXG3LgZNHkBqs47pRXt/$NEW_TOKEN/" "$CONFIG_FILE"

echo "✅ Token GitHub mis à jour !"
```

## 📋 Configuration Finale

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_[À_REMPLACER]"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "FILESYSTEM_ROOT": "/Users/jean-mariedelaunay/directus-unified-platform",
        "ALLOWED_DIRECTORIES": "/Users/jean-mariedelaunay/directus-unified-platform,/Users/jean-mariedelaunay/Documents,/Users/jean-mariedelaunay/Desktop"
      }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "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"
      }
    },
    "erpnext": {
      "command": "npx",
      "args": ["rakeshgangwar/erpnext-mcp-server"],
      "env": {
        "ERPNEXT_URL": "http://localhost:8083",
        "ERPNEXT_API_KEY": "erpnext_api_key_2025_dev",
        "ERPNEXT_API_SECRET": "erpnext_secret_key_secure_development_2025"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {}
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    }
  }
}
```

## ✅ Prochaines Étapes

1. **Générer token GitHub** (dernière étape !)
2. **Redémarrer Claude Desktop**
3. **Vérifier** que les 6 MCP apparaissent

## 💡 Pour Directus

Utilisez directement l'API REST :

```bash
# Exemple : Lister les collections
curl -H "Authorization: Bearer e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW" \
     http://localhost:8055/collections | jq

# Exemple : Récupérer des items
curl -H "Authorization: Bearer e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW" \
     http://localhost:8055/items/directus_users | jq
```

---

**Date** : 9 Août 2025  
**Progrès** : Notion MCP restauré avec succès !  
**Reste** : Token GitHub uniquement