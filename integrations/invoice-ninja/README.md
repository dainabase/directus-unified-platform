# Invoice Ninja v5 Integration avec Directus

Cette intégration permet la synchronisation bidirectionnelle des factures entre Directus et Invoice Ninja v5.

## 🚀 Installation

### 1. Démarrer Invoice Ninja

```bash
docker-compose -f docker-compose.invoice-ninja.yml up -d
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Invoice Ninja

```bash
npm run setup
```

Cela va :
- Créer un compte administrateur
- Configurer 5 compagnies (une par entreprise)
- Sauvegarder les API tokens dans Directus

### 4. Synchroniser les factures existantes

```bash
npm run sync
```

### 5. Démarrer le webhook receiver

```bash
npm run webhook
```

## 📋 Configuration

### Variables d'environnement (.env.invoice-ninja)

- `APP_URL` : URL d'Invoice Ninja (par défaut: http://localhost:8090)
- `APP_KEY` : Clé de chiffrement (générée automatiquement)
- `IN_USER_EMAIL` : Email de l'admin Invoice Ninja
- `IN_PASSWORD` : Mot de passe admin
- `WEBHOOK_SECRET` : Secret pour valider les webhooks

### Entreprises configurées

1. **HYPERVISUAL** - Studio Créatif
2. **DAINAMICS** - Solutions Tech
3. **LEXAIA** - Services Juridiques
4. **ENKI_REALTY** - Immobilier Premium
5. **TAKEOUT** - Restauration

## 🔄 Synchronisation

### Directus → Invoice Ninja

Le script `sync-invoices.js` :
- Récupère toutes les factures de Directus
- Crée/met à jour les clients dans Invoice Ninja
- Synchronise les factures avec le bon statut
- Enregistre les paiements si nécessaire

### Invoice Ninja → Directus

Le webhook receiver (`invoice-webhook.js`) :
- Écoute sur le port 3001
- Reçoit les événements d'Invoice Ninja
- Met à jour Directus en temps réel

## 🔗 URLs importantes

- **Invoice Ninja** : http://localhost:8090
- **Admin Invoice Ninja** : http://localhost:8090/login
- **Webhook Endpoint** : http://localhost:3001/webhook/invoice-ninja
- **Health Check** : http://localhost:3001/health

## 📊 Structure des données

### Collection Directus : `invoice_ninja_companies`

```javascript
{
  company_key: "HYPERVISUAL",
  company_name: "HYPERVISUAL Studio Créatif",
  invoice_ninja_id: "01234567890",
  api_token: "token_xyz..."
}
```

### Mapping des statuts

| Directus | Invoice Ninja |
|----------|---------------|
| draft    | 1             |
| sent     | 2             |
| paid     | 4             |
| overdue  | -1            |
| cancelled| 5             |

## 🛠 Commandes utiles

```bash
# Vérifier les logs Invoice Ninja
docker logs invoice-ninja-app

# Redémarrer Invoice Ninja
docker-compose -f docker-compose.invoice-ninja.yml restart

# Arrêter Invoice Ninja
docker-compose -f docker-compose.invoice-ninja.yml down

# Supprimer toutes les données
docker-compose -f docker-compose.invoice-ninja.yml down -v
```

## ⚠️ Troubleshooting

### Invoice Ninja ne démarre pas
- Vérifier que les ports 8090, 3306 ne sont pas utilisés
- Attendre 1-2 minutes pour le premier démarrage

### Erreur de synchronisation
- Vérifier le token Directus dans les scripts
- S'assurer que Invoice Ninja est accessible

### Webhooks non reçus
- Configurer le webhook dans Invoice Ninja Admin
- Utiliser `host.docker.internal` dans l'URL du webhook

## 📝 Notes

- Les factures sont liées par `invoice_number`
- L'ID Directus est stocké dans `custom_value1` d'Invoice Ninja
- Les clients sont créés automatiquement si nécessaire
- La devise par défaut est CHF (Franc Suisse)