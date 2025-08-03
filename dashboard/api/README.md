# API Proxy pour Notion

Ce dossier contient le proxy PHP nécessaire pour l'intégration Notion depuis le frontend.

## Installation

1. **Déployer le fichier PHP**
   - Copiez `notion-proxy.php` sur votre serveur web
   - Assurez-vous que PHP 7.4+ est installé
   - Vérifiez que l'extension CURL est activée

2. **Configuration serveur**
   ```bash
   # Apache (.htaccess)
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteRule ^api/notion-proxy$ notion-proxy.php [L]
   </IfModule>
   
   # Nginx
   location /api/notion-proxy {
       try_files $uri /api/notion-proxy.php?$query_string;
   }
   ```

3. **Permissions**
   ```bash
   chmod 755 notion-proxy.php
   ```

## Utilisation

### Test de connexion
```javascript
const response = await fetch('/api/notion-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'secret_YOUR_NOTION_API_KEY'
    },
    body: JSON.stringify({
        action: 'get_databases'
    })
});
```

### Créer une page
```javascript
const response = await fetch('/api/notion-proxy.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'secret_YOUR_NOTION_API_KEY'
    },
    body: JSON.stringify({
        action: 'create_page',
        data: {
            parent: { database_id: 'YOUR_DATABASE_ID' },
            properties: {
                "Titre": { title: [{ text: { content: "Mon document" } }] },
                "Montant": { number: 1234.56 }
            }
        }
    })
});
```

## Sécurité

- Le proxy valide que la clé API commence par `secret_`
- Les requêtes OPTIONS sont gérées pour CORS
- Timeout de 30 secondes sur les requêtes
- Gestion des erreurs avec messages explicites

## Mode simulation

Si le proxy n'est pas déployé, l'application OCR fonctionnera en mode simulation et sauvegardera les données localement.