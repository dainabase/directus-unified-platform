# Guide de Migration vers l'API Notion Réelle
*Date : 20 Janvier 2025*

## 🎯 Objectif
Remplacer tous les stubs de données par de vraies requêtes vers l'API Notion, en maintenant la sécurité et les performances.

## 📋 Plan de Migration

### Phase 1 : Configuration de Base
1. Configuration des clés API Notion
2. Création d'un serveur proxy pour sécuriser les clés
3. Mise à jour de notion-connector.js
4. Tests de connexion

### Phase 2 : Migration Progressive
1. Authentification utilisateurs
2. Données Client (projets, documents, finances)
3. Données Prestataire (missions, tâches, calendrier)
4. Données Revendeur (CRM, pipeline, commissions)
5. Modules transversaux (chat, timetracking)

### Phase 3 : Optimisations
1. Gestion de la pagination (100 items max par requête)
2. Cache intelligent avec invalidation
3. Gestion des erreurs réseau
4. Rate limiting

## 🔧 Configuration Requise

### 1. Clés API Notion
```javascript
// À ajouter dans un fichier .env (NE JAMAIS COMMITER)
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxx
NOTION_VERSION=2022-06-28
```

### 2. IDs des Bases de Données
```javascript
// Déjà définis dans notion-connector.js
const DATABASES = {
  // Authentification
  USERS: 'f5d6a111-e694-8014-b101-ce16fb21f644',
  
  // Client
  PROJECTS: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  DOCUMENTS: 'b2c3d4e5-f678-9012-bcde-f23456789012',
  INVOICES: 'c3d4e5f6-7890-1234-cdef-345678901234',
  
  // Prestataire
  MISSIONS: 'd4e5f6a7-8901-2345-defa-456789012345',
  TASKS: 'e5f6a7b8-9012-3456-efab-567890123456',
  REWARDS: 'f6a7b8c9-0123-4567-fabc-678901234567',
  
  // Revendeur
  PIPELINE: '22eadb95-3c6f-8024-89c2-fde6ef18d2d0',
  CLIENTS: '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
  COMMISSIONS: '236adb95-3c6f-80c0-9751-fcf5dfe35564'
};
```

### 3. Structure des Bases Notion

#### Base Users (Authentification)
| Propriété | Type | Description |
|-----------|------|-------------|
| Email | Email | Email unique de connexion |
| Password | Text | Hash du mot de passe |
| Name | Title | Nom complet |
| Roles | Multi-select | client, prestataire, revendeur |
| Avatar | URL | Photo de profil |
| Active | Checkbox | Compte actif |
| CreatedAt | Created time | Date création |

#### Base Projects (Client)
| Propriété | Type | Description |
|-----------|------|-------------|
| Name | Title | Nom du projet |
| ClientId | Relation → Users | Client propriétaire |
| Status | Select | En cours, Terminé, En pause |
| Progress | Number | Pourcentage 0-100 |
| Budget | Number | Budget en CHF |
| StartDate | Date | Date début |
| EndDate | Date | Date fin |
| Description | Text | Description détaillée |
| Team | People | Équipe assignée |

## 🔄 Architecture de Migration

### 1. Serveur Proxy Sécurisé
```javascript
// server/notion-proxy.js
const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(cors());
app.use(express.json());

// Middleware de sécurité
app.use((req, res, next) => {
  const authToken = req.headers.authorization;
  // Vérifier JWT token
  // Vérifier permissions
  next();
});

// Routes API
app.post('/api/notion/query', async (req, res) => {
  try {
    const { database_id, filter, sorts, page_size } = req.body;
    const response = await notion.databases.query({
      database_id,
      filter,
      sorts,
      page_size: page_size || 100
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Mise à jour notion-connector.js
```javascript
// Nouvelle architecture avec vraies requêtes
const NotionConnector = {
  // Configuration
  API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.votredomaine.com/notion'
    : 'http://localhost:3001/api/notion',
    
  // Headers avec auth
  getHeaders() {
    const user = window.AuthNotionModule?.getCurrentUser();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    };
  },
  
  // Requête générique avec gestion d'erreurs
  async query(databaseId, options = {}) {
    try {
      const response = await fetch(`${this.API_URL}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          database_id: databaseId,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseNotionResponse(data);
      
    } catch (error) {
      console.error('Notion API Error:', error);
      throw error;
    }
  },
  
  // Parser les réponses Notion
  parseNotionResponse(response) {
    return response.results.map(page => ({
      id: page.id,
      ...this.parseProperties(page.properties)
    }));
  },
  
  parseProperties(properties) {
    const parsed = {};
    
    for (const [key, value] of Object.entries(properties)) {
      switch (value.type) {
        case 'title':
          parsed[key] = value.title[0]?.plain_text || '';
          break;
        case 'rich_text':
          parsed[key] = value.rich_text[0]?.plain_text || '';
          break;
        case 'number':
          parsed[key] = value.number;
          break;
        case 'select':
          parsed[key] = value.select?.name || '';
          break;
        case 'multi_select':
          parsed[key] = value.multi_select.map(item => item.name);
          break;
        case 'date':
          parsed[key] = value.date?.start || null;
          break;
        case 'checkbox':
          parsed[key] = value.checkbox;
          break;
        case 'url':
          parsed[key] = value.url;
          break;
        case 'email':
          parsed[key] = value.email;
          break;
        case 'relation':
          parsed[key] = value.relation.map(rel => rel.id);
          break;
        case 'people':
          parsed[key] = value.people.map(person => person.id);
          break;
      }
    }
    
    return parsed;
  }
};
```

## 📝 Ordre de Migration Recommandé

### 1. Authentification (Priorité HAUTE)
- [ ] Migrer auth-notion.js pour vraie vérification
- [ ] Implémenter JWT tokens
- [ ] Gérer les sessions

### 2. Données en Lecture Seule (Priorité MOYENNE)
- [ ] Dashboards (tous les rôles)
- [ ] Listes (projets, missions, etc.)
- [ ] Détails (project-detail, mission-detail)

### 3. Données en Écriture (Priorité MOYENNE)
- [ ] Création d'entrées (projets, tâches, etc.)
- [ ] Modifications
- [ ] Suppressions

### 4. Fonctionnalités Complexes (Priorité BASSE)
- [ ] Upload de fichiers
- [ ] Chat temps réel
- [ ] Notifications

## ⚠️ Points d'Attention

### Limites API Notion
- **Rate limit** : 3 requêtes/seconde
- **Pagination** : 100 items max par page
- **Timeout** : 60 secondes max
- **Taille requête** : 1MB max

### Gestion des Erreurs
```javascript
// Wrapper pour toutes les requêtes
async function notionRequest(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) { // Rate limited
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else if (error.status >= 500) { // Server error
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw error; // Client error, ne pas réessayer
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Cache Intelligent
```javascript
const NotionCache = {
  cache: new Map(),
  
  set(key, data, ttl = 300000) { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  },
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
};
```

## 🚀 Prochaines Étapes

1. **Installer les dépendances serveur**
```bash
npm init -y
npm install express @notionhq/client cors dotenv jsonwebtoken
npm install -D nodemon
```

2. **Créer le serveur proxy**

3. **Migrer module par module**

4. **Tester chaque migration**

5. **Déployer progressivement**