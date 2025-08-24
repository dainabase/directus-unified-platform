# 🔧 CORRIGER TOUTES LES ERREURS MCP

## 🔴 Problèmes Identifiés

### 1. **Notion** - Token Invalide
- **Erreur** : "API token is invalid"
- **Clé actuelle** : `secret_A93L...mBmf` (invalide)

### 2. **GitHub** - Token Invalide  
- **Erreur** : "Bad credentials"
- **Token actuel** : `ghp_ZUBv...pRXt` (invalide)

### 3. **Directus** - Serveur Complexe
- **Erreur** : "Server disconnected"
- **Solution** : Supprimé (utiliser API REST directement)

### 4. **MCP-Installer** - Non nécessaire
- **Erreur** : "Server disconnected"
- **Solution** : Supprimé

## ✅ Configuration Simplifiée

Après nettoyage, voici les MCP qui FONCTIONNENT :
- **Filesystem** ✅
- **Memory** ✅  
- **Puppeteer** ✅
- **ERPNext** ✅

## 🚀 Actions Correctives

### 1. Générer Nouveau Token GitHub

```bash
# 1. Aller sur : https://github.com/settings/tokens/new
# 2. Nom : "Claude Desktop MCP"
# 3. Expiration : 90 jours
# 4. Permissions :
#    - ✅ repo (Full control)
#    - ✅ read:user
#    - ✅ read:org
#    - ✅ gist

# 5. Copier le token (format : ghp_xxxxxxxxxxxx)
```

### 2. Générer Nouvelle Clé Notion

```bash
# 1. Aller sur : https://www.notion.so/my-integrations
# 2. Cliquer sur votre intégration ou créer une nouvelle
# 3. Nom : "Claude Desktop Integration"
# 4. Capabilities :
#    - ✅ Read content
#    - ✅ Update content
#    - ✅ Insert content
#    - ✅ Read comments
#    - ✅ Create comments

# 5. Copier la clé API (format : secret_xxxxxxxxxxxx)
# 6. IMPORTANT : Partager des pages avec cette intégration !
```

### 3. Script de Mise à Jour Automatique

Créez un fichier `update-tokens.sh` :

```bash
#!/bin/bash

# Variables à remplir
GITHUB_TOKEN="VOTRE_NOUVEAU_TOKEN_GITHUB"
NOTION_KEY="VOTRE_NOUVELLE_CLE_NOTION"

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Sauvegarde
cp "$CONFIG_FILE" "$CONFIG_FILE.backup_$(date +%Y%m%d_%H%M%S)"

# Mise à jour avec jq (plus sûr)
if command -v jq &> /dev/null; then
    # Avec jq
    jq ".mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = \"$GITHUB_TOKEN\" | \
        .mcpServers.notion.env.NOTION_API_KEY = \"$NOTION_KEY\"" \
        "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
else
    # Sans jq (sed)
    sed -i '' "s/ghp_ZUBvhZnxHMZlMUvw4jXG3LgZNHkBqs47pRXt/$GITHUB_TOKEN/" "$CONFIG_FILE"
    sed -i '' "s/secret_A93Lhgx9PW94Fgg3gOqFi1O9aHCHVB2ATu0HKp8mBmf/$NOTION_KEY/" "$CONFIG_FILE"
fi

echo "✅ Tokens mis à jour !"
```

### 4. Configuration Finale Attendue

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_VOTRE_NOUVEAU_TOKEN"
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
        "NOTION_API_KEY": "secret_VOTRE_NOUVELLE_CLE"
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

## 📊 Pour Directus

Au lieu d'un MCP complexe, utilisez directement les outils Claude Code :
- `WebFetch` pour les requêtes API
- `Bash` avec `curl` pour les opérations complexes

Exemple :
```bash
# Lister les collections
curl -H "Authorization: Bearer e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW" \
     http://localhost:8055/collections

# Récupérer des items
curl -H "Authorization: Bearer e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW" \
     http://localhost:8055/items/ma_collection
```

## ✅ Checklist Finale

1. [ ] Générer nouveau token GitHub
2. [ ] Générer nouvelle clé API Notion
3. [ ] Mettre à jour les tokens dans la config
4. [ ] Supprimer directus et mcp-installer de la config
5. [ ] Redémarrer Claude Desktop
6. [ ] Vérifier que les 6 MCP restants fonctionnent

## 🎯 Résultat Attendu

Après corrections :
- **6 MCP fonctionnels** (au lieu de 8)
- GitHub ✅
- Notion ✅  
- Filesystem ✅
- ERPNext ✅
- Memory ✅
- Puppeteer ✅

---

**Note** : Les MCP "directus" et "mcp-installer" ont été retirés car ils causaient des erreurs de déconnexion. Utilisez les outils natifs de Claude Code pour Directus.