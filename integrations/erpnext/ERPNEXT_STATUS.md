# 📊 ERPNEXT V15 - ÉTAT DE L'INSTALLATION

## ⚠️ STATUT ACTUEL : CONFIGURATION EN COURS

ERPNext nécessite une configuration complexe et plusieurs tentatives ont été effectuées :

### 🔧 Configurations disponibles

#### 1. **Version Complète** (`docker-compose.yml`)
- **Services** : 11 containers (backend, frontend, socketio, workers, db, redis)
- **Port** : 8083 (frontend), 8001 (backend), 9000 (socketio)
- **Status** : ❌ Échec (image v15.latest introuvable)

#### 2. **Version Simplifiée** (`docker-compose-simple.yml`)
- **Services** : 3 containers (app, db, redis)
- **Port** : 8083
- **Status** : ⚠️ Démarre mais nécessite configuration manuelle

#### 3. **Version Ultra-Simple** (`docker-compose-ultra-simple.yml`)  
- **Services** : 1 container tout-en-un
- **Port** : 8083
- **Status** : ❌ Problème de configuration Procfile

## 🎯 RECOMMANDATION : UTILISER INVOICE NINJA

Étant donné la complexité d'ERPNext et les problèmes de configuration rencontrés, **Invoice Ninja** (déjà 100% fonctionnel sur le port 8090) peut couvrir les besoins de facturation :

### ✅ **Invoice Ninja (Recommandé)**
- **URL** : http://localhost:8090
- **Status** : 100% opérationnel
- **Features** : Facturation, devis, paiements, multi-entreprises
- **Avantages** : Stable, configuré, prêt à l'emploi

### 🔄 **ERPNext (En développement)**
- **URL** : http://localhost:8083 (quand fonctionnel)
- **Status** : Configuration en cours
- **Features** : ERP complet (comptabilité, stock, CRM, RH)

## 📋 FICHIERS CRÉÉS

### Configuration Docker
- `docker-compose.yml` : Configuration complète (11 services)
- `docker-compose-simple.yml` : Version simplifiée (3 services)
- `docker-compose-ultra-simple.yml` : Version minimale (1 service)
- `docker-compose-fixed.yml` : Ancienne version (supprimée)

### Scripts
- `migrate-to-erpnext.js` : Migration des données Directus → ERPNext
- `test-erpnext.sh` : Tests de santé et diagnostic
- `ERPNEXT_STATUS.md` : Cette documentation

## 🔧 Commandes utiles

### Test de statut
```bash
cd integrations/erpnext && ./test-erpnext.sh
```

### Redémarrer (version simplifiée)
```bash
cd integrations/erpnext
docker-compose -f docker-compose-simple.yml down
docker-compose -f docker-compose-simple.yml up -d
```

### Voir les logs
```bash
docker logs erpnext-simple -f  # ou erpnext-ultra selon la version
```

### Accès manuel au container
```bash
docker exec -it erpnext-simple bash
bench console  # Console ERPNext
```

## ⚠️ PROBLÈMES IDENTIFIÉS

1. **Images Docker** : Les versions spécifiques (v14.latest, v15.latest) n'existent pas
2. **Configuration réseau** : Problèmes de connexion entre containers
3. **Initialisation** : Nécessite une configuration manuelle complexe
4. **Procfile** : Fichier de configuration manquant dans l'image Docker

## 🎯 SOLUTIONS ALTERNATIVES

### Option 1 : Utiliser uniquement Invoice Ninja
- ✅ Déjà fonctionnel
- ✅ Couvre la facturation multi-entreprises  
- ✅ Interface moderne et stable

### Option 2 : Configuration manuelle ERPNext
1. Utiliser l'image officielle frappe/erpnext:latest
2. Configuration manuelle via interface web
3. Temps estimé : 2-3 heures

### Option 3 : ERPNext hébergé
- Utiliser ERPNext Cloud (frappe.cloud)
- Intégration via API REST
- Coût : ~$5-15/mois par utilisateur

## 📊 RECOMMANDATION FINALE

**Pour l'immédiat** : Continuer avec Invoice Ninja (100% fonctionnel)
**Pour l'avenir** : Reprendre ERPNext quand plus de temps disponible ou utiliser la version hébergée

---

**Date** : 9 Août 2024  
**Status** : Configuration partielle, alternative recommandée
**Scripts créés** : ✅ Tests et migration prêts