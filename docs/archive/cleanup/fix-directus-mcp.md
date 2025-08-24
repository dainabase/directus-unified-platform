# 🔧 CORRECTION MCP DIRECTUS

## ✅ Diagnostic Effectué

1. **Directus est accessible** : http://localhost:8055 ✅
2. **Token valide** : e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW ✅
3. **API fonctionnelle** : /server/health répond OK ✅

## 🔄 Configuration Mise à Jour

J'ai remplacé le serveur MCP personnalisé par **@pixelsock/directus-mcp** :

```json
"directus": {
  "command": "npx",
  "args": ["-y", "@pixelsock/directus-mcp@latest"],
  "env": {
    "DIRECTUS_URL": "http://localhost:8055",
    "DIRECTUS_ACCESS_TOKEN": "e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW"
  }
}
```

## 🚀 Actions Requises

### 1. Corriger les permissions NPM (optionnel)
```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. Redémarrer Claude Desktop
**OBLIGATOIRE** pour activer la nouvelle configuration

### 3. Vérifier le MCP Directus
Après redémarrage, vous devriez voir les outils Directus disponibles

## 🔄 Configurations Alternatives

Si @pixelsock/directus-mcp ne fonctionne pas, essayez :

### Option 1 : @directus/content-mcp
```json
"directus": {
  "command": "npx",
  "args": ["-y", "@directus/content-mcp@latest"],
  "env": {
    "DIRECTUS_URL": "http://localhost:8055",
    "DIRECTUS_TOKEN": "e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW"
  }
}
```

### Option 2 : Avec authentification email/password
```json
"directus": {
  "command": "npx",
  "args": ["-y", "@pixelsock/directus-mcp@latest"],
  "env": {
    "DIRECTUS_URL": "http://localhost:8055",
    "DIRECTUS_EMAIL": "jmd@hypervisual.ch",
    "DIRECTUS_PASSWORD": "[VOTRE_MOT_DE_PASSE]"
  }
}
```

## 📊 Résumé

- **Problème** : Le serveur MCP personnalisé local causait des déconnexions
- **Solution** : Utilisation du serveur officiel @pixelsock/directus-mcp
- **Token** : e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW (full access JMD)
- **URL** : http://localhost:8055

## ⚠️ Notes Importantes

1. Le token utilisé est le token administrateur complet JMD
2. La variable d'environnement est `DIRECTUS_ACCESS_TOKEN` (pas `DIRECTUS_TOKEN`)
3. Utilisez `@latest` pour avoir la dernière version du MCP

## 🎯 Résultat Attendu

Après redémarrage de Claude Desktop, vous devriez avoir accès aux outils Directus :
- Lister les collections
- Lire/créer/modifier des items
- Gérer les utilisateurs et permissions
- Accéder aux assets et fichiers