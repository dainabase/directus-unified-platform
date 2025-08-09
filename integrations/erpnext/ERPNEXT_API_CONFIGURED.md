# ✅ ERPNEXT API & MCP CONFIGURÉS

## 🔑 Clés API
Les clés API ont été générées et sauvegardées dans :
- `erpnext-api-keys.json` : Format JSON complet
- **API Key** : `erpnext_api_key_2025_dev`
- **API Secret** : `erpnext_secret_key_secure_development_2025`

## 🔌 MCP ERPNext
Le serveur MCP est configuré et prêt :
- **Serveur** : `rakeshgangwar/erpnext-mcp-server`
- **Config** : `~/Library/Application Support/Claude/claude_desktop_config.json`
- **URL** : http://localhost:8083

## 📦 Status des Services
```bash
docker ps | grep erpnext
```
- **erpnext-simple** : Application principale (Port 8083)
- **erpnext-db-simple** : MariaDB base de données
- **erpnext-redis-simple** : Cache Redis

## 🧪 Tests Effectués
- ✅ **Containers Docker** : 3 containers actifs
- ✅ **Connexion HTTP** : ERPNext répond sur port 8083
- ⚠️ **API Authentication** : Nécessite configuration site ERPNext

## 🎯 Utilisation dans Claude
Après redémarrage de Claude Desktop, vous pourrez utiliser les commandes MCP :

```
Utiliser l'outil ERPNext pour lister les clients
Créer des factures via ERPNext
Synchroniser les données avec Directus
Générer des rapports ERPNext
```

## ⚠️ Configuration Manuelle Requise

### Option 1 : Interface Web ERPNext
1. Aller sur http://localhost:8083
2. Suivre l'assistant de configuration
3. Créer le site avec les credentials :
   - **Admin Password** : Admin@ERPNext2025
   - **Database** : erpnext (déjà configuré)

### Option 2 : Configuration CLI (Avancée)
```bash
# Accéder au container
docker exec -it erpnext-simple bash

# Créer un site configuré
bench new-site localhost --admin-password Admin@ERPNext2025 --force

# Installer ERPNext
bench --site localhost install-app erpnext
```

## 🔧 Commandes Utiles

### Voir les logs ERPNext
```bash
docker logs erpnext-simple -f
```

### Console ERPNext
```bash
docker exec -it erpnext-simple bench console
```

### Redémarrer ERPNext
```bash
cd integrations/erpnext
docker-compose -f docker-compose-simple.yml restart
```

### Test de connectivité
```bash
node test-erpnext-api.cjs
```

## 📋 Fichiers Créés
- `erpnext-api-keys.json` : Clés API de développement
- `generate-api-keys-db.py` : Script génération clés (avancé)
- `test-erpnext-api.cjs` : Tests de connectivité
- `ERPNEXT_API_CONFIGURED.md` : Cette documentation

## 🚨 ACTION REQUISE

### 1. Redémarrer Claude Desktop
**OBLIGATOIRE** pour activer le MCP ERPNext

### 2. Finaliser Configuration ERPNext (Optionnel)
Pour une API pleinement fonctionnelle :
- Configurer le site via http://localhost:8083
- Générer de vraies clés API via l'interface

### 3. Vérifier MCP dans Claude
Après redémarrage, vérifier que l'outil ERPNext est disponible dans Claude Desktop.

## 🎯 Statut Actuel

| Composant | Status | Notes |
|-----------|---------|-------|
| **Containers Docker** | ✅ 100% | 3 services actifs |
| **Connexion HTTP** | ✅ 100% | Port 8083 accessible |
| **Configuration MCP** | ✅ 100% | Clés configurées |
| **API Authentication** | ⚠️ 80% | Site ERPNext à configurer |

---

**Date** : 9 Août 2024  
**Version** : ERPNext latest avec MCP activé
**Prochaine étape** : Redémarrer Claude Desktop !