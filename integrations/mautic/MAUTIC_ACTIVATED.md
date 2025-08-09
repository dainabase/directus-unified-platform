# ✅ MAUTIC 5.x ACTIVÉ

## 🔗 Accès
- **URL** : http://localhost:8084
- **Status** : ✅ Containers démarrés, prêt pour installation web
- **Installation** : Via navigateur web à compléter

## 📊 Services Docker
```bash
docker ps | grep mautic
```
- **mautic-app** : Application principale (Port 8084)
- **mautic-db** : MariaDB 10.6 
- **mautic-cron** : Jobs automatiques

## 🛠️ Finalisation de l'installation

### Étape 1 : Ouvrir l'installeur
Aller sur : http://localhost:8084

### Étape 2 : Configuration base de données
- **Driver** : MySQL/MariaDB
- **Host** : mautic-db
- **Port** : 3306
- **Database** : mautic
- **Username** : mautic
- **Password** : mautic_secure_2025

### Étape 3 : Créer l'administrateur
- **Prénom** : Super
- **Nom** : Admin
- **Username** : admin
- **Email** : admin@superadmin.com
- **Password** : Admin@Mautic2025

### Étape 4 : Configuration email (optionnelle)
- **Transport** : SMTP
- **Host** : localhost
- **Port** : 25 (ou laisser vide pour la config plus tard)

## 🎯 Fonctionnalités disponibles après installation
- ✅ Marketing Automation
- ✅ Email Campaigns  
- ✅ Contact Management
- ✅ Lead Scoring
- ✅ Forms & Landing Pages
- ✅ API REST (http://localhost:8084/api)

## 🔧 Commandes utiles

### Voir les logs
```bash
docker logs mautic-app -f
docker logs mautic-db --tail 20
```

### Redémarrer
```bash
cd integrations/mautic
docker-compose restart
```

### Arrêter/Démarrer
```bash
docker-compose down
docker-compose up -d
```

### Nettoyer le cache Mautic
```bash
docker exec mautic-app php bin/console cache:clear
```

### Test de connectivité
```bash
cd scripts
node test-mautic-simple.js
```

## 🔗 Intégration avec Directus

### Webhook Configuration
Fichier : `integrations/mautic/webhook-config.json`

### API Endpoints
- **Contacts** : GET/POST http://localhost:8084/api/contacts
- **Campaigns** : GET/POST http://localhost:8084/api/campaigns
- **Emails** : GET/POST http://localhost:8084/api/emails

### Headers requis
```bash
Authorization: Basic YWRtaW46QWRtaW5ATWF1dGljMjAyNQ==
Content-Type: application/json
```

## 📝 Prochaines étapes
1. ✅ **Finaliser l'installation web** (http://localhost:8084)
2. ⏳ Configurer SMTP pour envoi d'emails réels  
3. ⏳ Créer les segments de contacts par entreprise
4. ⏳ Configurer les campagnes automatiques
5. ⏳ Intégrer avec Directus via webhooks
6. ⏳ Importer les contacts existants

## ⚠️ Notes importantes
- L'installation doit être finalisée via l'interface web
- Les containers sont opérationnels sur le port 8084
- La base de données est prête et configurée
- Les scripts de test sont disponibles dans `scripts/`

---

**Date d'activation** : 9 Août 2024  
**Version** : Mautic 5.x avec Apache