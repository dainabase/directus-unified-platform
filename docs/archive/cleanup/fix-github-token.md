# 🔧 CORRIGER LE TOKEN GITHUB

## ❌ Problème Actuel
- **Erreur** : "Authentication Failed: Bad credentials"
- **Token actuel** : `ghp_ZUBvhZnxHMZlMUvw4jXG3LgZNHkBqs47pRXt` (invalide ou expiré)

## 🚀 Solution Rapide

### 1. Créer un Nouveau Token GitHub

1. Aller sur : https://github.com/settings/tokens/new
2. **Note** : "Claude Desktop MCP"
3. **Expiration** : 90 jours (ou "No expiration")
4. **Permissions requises** :
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
   - ✅ `read:org` (Read org and team membership)
   - ✅ `gist` (Create gists)

5. Cliquer sur **"Generate token"**
6. **COPIER LE TOKEN IMMÉDIATEMENT** (il ne sera plus visible après)

### 2. Mettre à Jour la Configuration

```bash
# Remplacer YOUR_NEW_TOKEN par le token copié
NEW_TOKEN="YOUR_NEW_TOKEN"

# Mettre à jour le fichier de configuration
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Faire une sauvegarde d'abord
cp "$CONFIG_FILE" "$CONFIG_FILE.backup_$(date +%Y%m%d_%H%M%S)"

# Remplacer l'ancien token
sed -i '' "s/ghp_ZUBvhZnxHMZlMUvw4jXG3LgZNHkBqs47pRXt/$NEW_TOKEN/" "$CONFIG_FILE"

echo "✅ Token GitHub mis à jour !"
```

### 3. Vérifier la Configuration

```bash
# Vérifier que le token est bien remplacé
grep GITHUB_PERSONAL_ACCESS_TOKEN "$CONFIG_FILE"
```

### 4. Redémarrer Claude Desktop

**OBLIGATOIRE** pour que le nouveau token soit pris en compte.

## 📋 Configuration Filesystem (Optionnel)

Pour activer l'accès aux fichiers locaux :

```bash
# Ajouter des répertoires autorisés
cat > update-filesystem-config.js << 'EOF'
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.env.HOME, 'Library/Application Support/Claude/claude_desktop_config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Ajouter les répertoires autorisés
config.mcpServers.filesystem.env.ALLOWED_DIRECTORIES = JSON.stringify([
  "/Users/jean-mariedelaunay/directus-unified-platform",
  "/Users/jean-mariedelaunay/Documents",
  "/Users/jean-mariedelaunay/Desktop"
]);

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ Répertoires autorisés configurés');
EOF

node update-filesystem-config.js
```

## 🔍 Vérifier Directus MCP

Le MCP Directus est configuré mais n'apparaît pas dans votre diagnostic. Après redémarrage de Claude Desktop, il devrait apparaître avec :

- **URL** : http://localhost:8055
- **Token** : e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW
- **Commande** : node .mcp/directus-mcp-server.js

## ✅ Checklist Finale

- [ ] Nouveau token GitHub généré
- [ ] Token remplacé dans la configuration
- [ ] Claude Desktop redémarré
- [ ] GitHub MCP fonctionne
- [ ] Directus MCP apparaît
- [ ] Filesystem configuré (optionnel)

## 📊 Résultat Attendu

Après ces corrections :
- **8/8 MCP fonctionnels** (100%)
- GitHub : ✅ Authentifié
- Directus : ✅ Visible et fonctionnel
- Filesystem : ✅ Avec répertoires autorisés