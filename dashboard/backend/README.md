# OCR Notion Backend

Backend Node.js pour le système OCR avec intégration Notion API.

## 🚀 Installation

```bash
cd portal-project/backend
npm install
```

## ⚙️ Configuration

1. Copier le fichier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Configurer les variables d'environnement:

### Configuration serveur
- `PORT=3001` - Port du serveur
- `NODE_ENV=development` - Environnement (development/production)

### Configuration Notion
- `NOTION_API_KEY` - Clé API Notion (obtenir sur https://www.notion.so/my-integrations)
- `NOTION_DB_FACTURES_CLIENTS` - ID de la base Factures Clients
- `NOTION_DB_FACTURES_FOURNISSEURS` - ID de la base Factures Fournisseurs
- `NOTION_DB_DEVIS` - ID de la base Devis
- `NOTION_DB_NOTES_FRAIS` - ID de la base Notes de Frais
- `NOTION_DB_TICKETS_CB` - ID de la base Tickets CB

### Configuration OpenAI
- `OPENAI_API_KEY` - Clé API OpenAI pour l'analyse IA

### Configuration stockage
- `UPLOAD_DIR=./uploads` - Dossier de stockage des fichiers
- `MAX_FILE_SIZE=10485760` - Taille max des fichiers (10MB)
- `ALLOWED_FILE_TYPES=pdf,png,jpg,jpeg,heic` - Types de fichiers autorisés

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## 📡 API Endpoints

### OCR

#### POST `/api/ocr/upload`
Upload et traitement d'un document
```javascript
// Form data avec fichier
const formData = new FormData();
formData.append('document', file);

fetch('http://localhost:3001/api/ocr/upload', {
    method: 'POST',
    body: formData
})
```

#### POST `/api/ocr/analyze`
Analyse de texte sans upload
```javascript
fetch('http://localhost:3001/api/ocr/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: 'Texte du document',
        documentType: 'facture_client' // optionnel
    })
})
```

#### POST `/api/ocr/save-to-notion`
Sauvegarde dans Notion
```javascript
fetch('http://localhost:3001/api/ocr/save-to-notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fileId: 'uuid-file-id',
        documentType: 'facture_client',
        extractedData: { /* données extraites */ }
    })
})
```

#### POST `/api/ocr/batch`
Traitement par lot
```javascript
const formData = new FormData();
files.forEach(file => formData.append('documents', file));

fetch('http://localhost:3001/api/ocr/batch', {
    method: 'POST',
    body: formData
})
```

### Notion

#### GET `/api/notion/databases`
Liste des bases de données configurées

#### POST `/api/notion/search`
Recherche de documents
```javascript
fetch('http://localhost:3001/api/notion/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        documentType: 'facture_client',
        query: 'AN-00087'
    })
})
```

### Health Check

#### GET `/api/health`
Vérification basique

#### GET `/api/health/detailed`
Vérification détaillée avec statut des services

#### POST `/api/health/test-services`
Test de connexion aux services externes

## 🔧 Structure des données

### Types de documents supportés
- `facture_client` - Factures clients
- `facture_fournisseur` - Factures fournisseurs
- `devis` - Devis
- `note_frais` - Notes de frais
- `ticket_cb` - Tickets CB

### Format des données extraites
```javascript
{
    // Informations client (priorité haute)
    client: "PUBLIGRAMA ADVERTISING S.L.",
    clientAddress: "STREET O, NAVE 1 Riba-Roja del Turia",
    clientCountry: "Spain",
    
    // Informations document
    type: "facture_client",
    numero: "AN-00087",
    date: "2025-07-25",
    
    // Informations financières
    montant_ht: 7500,
    montant_tva: 0,
    montant_ttc: 7500,
    devise: "EUR",
    taux_tva: 0,
    vat_status: "hors_tva",
    
    // Métadonnées
    confidence: 0.95,
    typeConfidence: 0.92
}
```

## 🔒 Sécurité

- Rate limiting configuré (100 requêtes / 15 min)
- CORS configuré pour le frontend
- Validation des entrées avec express-validator
- Logs détaillés avec Winston
- Helmet pour les headers de sécurité

## 📝 Logs

Les logs sont stockés dans le dossier `logs/`:
- `combined.log` - Tous les logs
- `error.log` - Erreurs uniquement
- `exceptions.log` - Exceptions non gérées

## 🐛 Débogage

### Mode développement
```bash
# Activer les logs détaillés
LOG_LEVEL=debug npm run dev
```

### Test des services
```bash
# Tester la connexion Notion et OpenAI
curl -X POST http://localhost:3001/api/health/test-services
```

## 🚢 Déploiement

### PM2
```bash
# Installation PM2
npm install -g pm2

# Démarrage avec PM2
pm2 start server.js --name ocr-backend

# Monitoring
pm2 monit
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 📊 Monitoring

### Métriques disponibles
- Temps de traitement OCR
- Taux de succès/échec
- Utilisation mémoire/CPU
- Status des services externes

## 🤝 Support

En cas de problème:
1. Vérifier les logs dans `logs/error.log`
2. Vérifier la configuration dans `.env`
3. Tester les services avec `/api/health/test-services`
4. Vérifier la connexion réseau avec Notion/OpenAI