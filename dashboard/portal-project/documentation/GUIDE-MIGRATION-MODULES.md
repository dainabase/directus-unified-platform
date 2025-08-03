# Guide de Migration des Modules vers l'API Notion Réelle

## 📋 Plan de Migration Module par Module

### Phase 1 : Setup Infrastructure ✅
1. ✅ Créer serveur Node.js avec Express
2. ✅ Configurer routes API sécurisées
3. ✅ Implémenter service Notion
4. ✅ Créer client API (notion-api-client.js)
5. ✅ Migrer auth-notion.js → auth-notion-v2.js

### Phase 2 : Migration Authentification 🚧
- [ ] Tester auth-notion-v2.js en local
- [ ] Créer base Users dans Notion
- [ ] Migrer les utilisateurs de démo
- [ ] Remplacer auth-notion.js par v2
- [ ] Mettre à jour login.html

### Phase 3 : Migration Modules Client
- [ ] projects-notion.js → projects-notion-v2.js
- [ ] documents-notion.js → documents-notion-v2.js
- [ ] finances-notion.js → finances-notion-v2.js
- [ ] dashboard-client-notion.js → dashboard-client-notion-v2.js

### Phase 4 : Migration Modules Prestataire
- [ ] missions-notion.js → missions-notion-v2.js
- [ ] tasks-notion.js → tasks-notion-v2.js
- [ ] calendar-notion.js → calendar-notion-v2.js
- [ ] Autres modules...

### Phase 5 : Migration Modules Revendeur
- [ ] pipeline-notion.js → pipeline-notion-v2.js
- [ ] clients-notion.js → clients-notion-v2.js
- [ ] Autres modules...

## 🔄 Pattern de Migration pour Chaque Module

### 1. Créer une version v2 du module
```javascript
// Exemple : projects-notion-v2.js
const ProjectsNotionV2 = {
    // Remplacer les stubs par de vraies requêtes
    async getUserProjects(clientId) {
        try {
            // Ancienne version (stub)
            // return this.mockProjects;
            
            // Nouvelle version (API réelle)
            const response = await window.NotionAPIClient.cachedRequest(
                `projects-${clientId}`,
                () => window.NotionAPIClient.getClientProjects()
            );
            
            return response.results;
            
        } catch (error) {
            console.error('Erreur chargement projets:', error);
            throw error;
        }
    },
    
    // Créer un projet
    async createProject(projectData) {
        try {
            // Invalider le cache
            window.NotionAPIClient.invalidateCache('projects');
            
            // Créer via API
            const project = await window.NotionAPIClient.createPage(
                DATABASES.PROJECTS,
                {
                    name: projectData.name,
                    description: projectData.description,
                    budget: projectData.budget,
                    status: 'En cours',
                    startDate: new Date(),
                    clientId: window.AuthNotionModuleV2.getCurrentUser().id
                }
            );
            
            return project;
            
        } catch (error) {
            console.error('Erreur création projet:', error);
            throw error;
        }
    }
};
```

### 2. Tester la version v2
```html
<!-- Dans la page HTML, charger les deux versions -->
<script src="assets/js/projects-notion.js"></script>
<script src="assets/js/projects-notion-v2.js"></script>

<script>
// Tester avec un flag
const USE_V2 = true; // Basculer pour tester

if (USE_V2 && window.ProjectsNotionV2) {
    window.ProjectsNotion = window.ProjectsNotionV2;
}
</script>
```

### 3. Mettre à jour les références permissions
```javascript
// Avant (avec stubs)
const projects = await this.getUserProjects(clientId);

// Après (avec permissions middleware)
const projects = await window.PermissionsMiddleware.secureApiCall(
    'projects',
    'view',
    window.ProjectsNotionV2.getUserProjects.bind(window.ProjectsNotionV2),
    clientId
);
```

## 📊 Structure des Bases Notion Requises

### Base Projects
```
Properties:
- Name (Title) - Nom du projet
- ClientId (Relation → Users) - Client propriétaire
- Status (Select) - Options: En cours, Terminé, En pause, Annulé
- Progress (Number) - 0-100
- Budget (Number) - Montant en CHF
- Spent (Number) - Montant dépensé
- StartDate (Date) - Date de début
- EndDate (Date) - Date de fin
- Description (Text) - Description longue
- Team (People) - Équipe assignée
- Documents (Relation → Documents) - Documents liés
- Tasks (Relation → Tasks) - Tâches liées
- CreatedAt (Created time)
- UpdatedAt (Last edited time)
```

### Base Documents
```
Properties:
- Name (Title) - Nom du document
- Type (Select) - Options: Contrat, Facture, Rapport, Autre
- FileUrl (URL) - Lien vers le fichier
- FileSize (Number) - Taille en bytes
- ClientId (Relation → Users) - Propriétaire
- ProjectId (Relation → Projects) - Projet lié
- UploadedBy (People) - Qui a uploadé
- UploadedAt (Date) - Date d'upload
- Category (Select) - Catégorie
- Tags (Multi-select) - Tags
- Version (Number) - Version du document
```

### Base Missions
```
Properties:
- Title (Title) - Titre de la mission
- ClientName (Text) - Nom du client
- AssignedTo (People) - Prestataire assigné
- Status (Select) - Options: Nouvelle, En cours, Terminée, Annulée
- Priority (Select) - Options: Basse, Normale, Haute, Urgente
- StartDate (Date) - Date de début
- EndDate (Date) - Date de fin
- Budget (Number) - Budget alloué
- Description (Text) - Description détaillée
- Deliverables (Text) - Livrables attendus
- Progress (Number) - 0-100
- Tags (Multi-select) - Compétences requises
```

## 🧪 Tests de Migration

### 1. Test unitaire de connexion
```javascript
// test-connection.js
async function testNotionConnection() {
    try {
        // 1. Test login
        console.log('Test 1: Login...');
        const loginResult = await window.NotionAPIClient.login(
            'test@example.com',
            'password123'
        );
        console.log('✅ Login réussi:', loginResult);
        
        // 2. Test récupération user
        console.log('\nTest 2: Get current user...');
        const user = await window.NotionAPIClient.getCurrentUser();
        console.log('✅ User récupéré:', user);
        
        // 3. Test query database
        console.log('\nTest 3: Query projects...');
        const projects = await window.NotionAPIClient.getClientProjects();
        console.log('✅ Projects récupérés:', projects);
        
        // 4. Test création
        console.log('\nTest 4: Create project...');
        const newProject = await window.NotionAPIClient.createPage(
            'PROJECT_DB_ID',
            {
                name: 'Test Project',
                status: 'En cours',
                budget: 10000
            }
        );
        console.log('✅ Project créé:', newProject);
        
    } catch (error) {
        console.error('❌ Test échoué:', error);
    }
}
```

### 2. Checklist de validation
- [ ] L'authentification fonctionne
- [ ] Les tokens JWT sont correctement gérés
- [ ] Le refresh token fonctionne
- [ ] Les permissions sont vérifiées
- [ ] Le cache fonctionne correctement
- [ ] Les erreurs sont bien gérées
- [ ] Les données s'affichent correctement
- [ ] Les créations/modifications fonctionnent
- [ ] Pas de régression sur les fonctionnalités

## 🚨 Points d'Attention

### 1. Gestion des IDs
```javascript
// Notion utilise des UUIDs avec tirets
// Ancien : 'proj_123'
// Nouveau : 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

// Adapter le code qui dépend du format d'ID
```

### 2. Formats de dates
```javascript
// Notion retourne ISO 8601
// "2025-01-20T10:30:00.000Z"

// Convertir pour l'affichage
const date = new Date(notionDate);
const formatted = date.toLocaleDateString('fr-FR');
```

### 3. Propriétés nullables
```javascript
// Notion peut retourner null pour certaines propriétés
// Toujours vérifier avant utilisation

const budget = project.budget || 0;
const endDate = project.endDate || 'Non définie';
```

### 4. Limitations API
- Max 100 items par requête (pagination requise)
- Rate limit: 3 requêtes/seconde
- Timeout: 60 secondes
- Taille max requête: 1MB

## 📝 Rollback Plan

Si problème lors de la migration :

1. **Rollback immédiat**
```javascript
// Revenir à la v1
window.ProjectsNotion = window.ProjectsNotionV1;
```

2. **Désactiver le serveur API**
```javascript
// Forcer l'utilisation des stubs
window.USE_REAL_API = false;
```

3. **Restaurer localStorage**
```javascript
// Si corruption des données locales
localStorage.clear();
location.reload();
```

## ✅ Critères de Succès

Une migration est réussie quand :
1. ✅ Toutes les fonctionnalités existantes fonctionnent
2. ✅ Les performances sont acceptables (< 2s chargement)
3. ✅ Pas d'erreurs dans la console
4. ✅ Les données sont cohérentes
5. ✅ Les permissions sont respectées
6. ✅ Le cache fonctionne
7. ✅ Les tests passent