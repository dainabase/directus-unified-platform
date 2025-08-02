# 📋 Mapping DÉTAILLÉ : Préservation de TOUTES les fonctionnalités Notion

## 🔴 ENGAGEMENT : Aucune perte de fonctionnalité

Ce document garantit que CHAQUE fonctionnalité de vos 62 bases Notion sera préservée ou améliorée dans Directus.

## 🎯 Approche finale : 48-52 collections Directus

### Pourquoi pas 21 collections ?
- **21 collections = -66% = TROP RISQUÉ**
- **48-52 collections = -20% = SÉCURISÉ**
- Préserve la complexité métier
- Garde toutes les spécificités
- Évite les erreurs passées

## 📊 Module CRM : 12 bases → 10 collections

### 1. DB-CONTACTS-ENTREPRISES → `companies` (enrichie)
**Fonctionnalités Notion préservées :**
- ✅ Champs : Nom, Email, Téléphone, Adresse, Site web
- ✅ Relations : Contacts associés, Projets, Factures
- ✅ Rollups : CA total, Nb projets, Dernière interaction
- ✅ Vues : Kanban par statut, Table filtrée, Timeline

**Ajouts Directus :**
- 🆕 Code unique auto-généré
- 🆕 Géolocalisation adresse
- 🆕 API de vérification SIRET
- 🆕 Scoring automatique

### 2. DB-PROSPECTS → `companies` (type='prospect')
**Préservation :**
- ✅ Pipeline commercial complet
- ✅ Étapes de qualification
- ✅ Probabilité de conversion
- ✅ Automatisation emails

**Solution Directus :**
```javascript
// Utilisation du champ 'type' et 'sales_stage'
{
  type: 'prospect',
  sales_stage: 'qualification', // lead, qualified, proposal, negotiation
  probability: 30,
  next_action: '2024-01-15',
  assigned_to: 'user_id'
}
```

### 3. DB-FOURNISSEURS → `providers` (existe, enrichir)
**Spécificités préservées :**
- ✅ Conditions de paiement différentes
- ✅ Catalogues produits
- ✅ Certifications
- ✅ Évaluations fournisseurs

### 4. Relations CRM complexes
**Relations Notion → Relations Directus :**
```sql
-- Notion : Entreprise ↔ Contacts ↔ Projets
-- Directus : 
companies <-> people (many-to-many via company_people)
companies <-> projects (one-to-many)
people <-> projects (many-to-many via project_team)
```

## 💰 Module Finance : 15 bases → 14 collections

### 5. DB-FACTURES + DB-FACTURES-ARCHIVES
**ATTENTION : Ne JAMAIS fusionner (obligations légales)**

**Solution :**
- `client_invoices` : Factures actives (modifiables)
- `client_invoices_archive` : Factures validées (read-only)
- Trigger automatique après validation

### 6. DB-DEVIS → `quotes` (nouvelle)
**Workflow préservé :**
```javascript
// Statuts Notion préservés
statuts: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']

// Conversion automatique
if (status === 'accepted') {
  createInvoice(quote); // Automatisation préservée
}
```

### 7. DB-BUDGET → `budgets` (nouvelle)
**Formules complexes préservées :**
- ✅ Calculs prévisionnels
- ✅ Comparaison réel/budget
- ✅ Alertes dépassement
- ✅ Reports mensuels

## 🚀 Module Projets : 10 bases → 8 collections

### 8. DB-TACHES + DB-SOUS-TACHES → `deliverables`
**Hiérarchie préservée via self-relation :**
```javascript
{
  id: 1,
  title: "Tâche principale",
  parent_task: null,
  subtasks: [
    {
      id: 2,
      title: "Sous-tâche 1",
      parent_task: 1
    }
  ]
}
```

### 9. DB-GANTT → Vues Directus
**Pas besoin de collection séparée :**
- Vue Gantt native dans Directus
- Basée sur `projects` et `deliverables`
- Drag & drop préservé
- Export PDF/PNG

### 10. DB-TIMETRACKING → `time_entries` (nouvelle)
**Intégration préservée :**
- ✅ Timer start/stop
- ✅ Calculs automatiques
- ✅ Rapports par projet/personne
- ✅ Facturation horaire

## 👥 Module RH : 8 bases → 8 collections

### 11. DB-CONGES vs DB-ABSENCES
**CRITIQUE : Ne PAS fusionner**
- `time_off` : Congés payés (calculs légaux)
- `absences` : Autres absences (maladie, etc.)
- Règles de calcul DIFFÉRENTES

### 12. DB-EMPLOYES vs DB-COLLABORATEURS
**Statuts juridiques différents :**
- `employees` : CDI/CDD (cotisations)
- `contractors` : Freelances (factures)
- JAMAIS fusionner (légal)

## 📄 Module Documents : 6 bases → 4 collections

### 13. DB-DOCUMENTS + OCR
**OCR 100% préservé :**
```javascript
{
  collection: 'documents',
  fields: {
    file: 'uuid', // directus_files
    ocr_text: 'text', // Résultat OCR
    ocr_status: 'pending|processing|completed',
    ocr_engine: 'openai-vision', // NE PAS CHANGER
    ocr_confidence: 95.5
  }
}
```

## 🎯 Rollups complexes préservés

### Exemple : CA total par entreprise
**Notion :** Rollup(Factures, SUM, Montant)
**Directus :** 
```sql
-- Vue SQL ou champ calculé
SELECT 
  c.id,
  c.name,
  COALESCE(SUM(i.amount), 0) as total_revenue
FROM companies c
LEFT JOIN client_invoices i ON i.company_id = c.id
WHERE i.status = 'paid'
GROUP BY c.id
```

### Exemple : Temps total par projet
**Notion :** Rollup(Tâches.Temps, SUM)
**Directus :** Hook en temps réel
```javascript
// Hook on time_entries
hooks.on('items.create', async (payload, context) => {
  if (context.collection === 'time_entries') {
    await updateProjectTotalTime(payload.project_id);
  }
});
```

## 🔄 Automatisations préservées

### 1. Création auto de tâches
**Notion :** Template de projet
**Directus :** Flow + Operation
```javascript
// Flow trigger: on project.create
// Operation: create tasks from template
const template = await getTemplate(project.template_id);
for (const task of template.tasks) {
  await createTask({
    ...task,
    project_id: project.id
  });
}
```

### 2. Notifications
**Notion :** Notifications natives
**Directus :** 
- Notifications in-app
- Emails via Flow
- Webhooks pour Slack/Teams
- Push notifications

## 📊 Vues personnalisées

### Vues Notion → Layouts Directus

| Vue Notion | Layout Directus | Fonctionnalités |
|------------|----------------|----------------|
| Table | Table Layout | Tri, filtre, colonnes |
| Kanban | Kanban Layout | Drag & drop, swimlanes |
| Calendar | Calendar Layout | Events, drag to reschedule |
| Gallery | Cards Layout | Images, custom template |
| Timeline | Gantt Extension | Dependencies, milestones |
| List | Table (compact) | Grouping, sorting |

## 🔐 Permissions granulaires

### Exemple : Accès clients
```javascript
// Notion : Vue filtrée pour clients
// Directus : Policy personnalisée
{
  collection: 'projects',
  action: 'read',
  permissions: {
    _and: [
      { client_id: { _eq: '$CURRENT_USER.company_id' } },
      { status: { _in: ['active', 'completed'] } }
    ]
  }
}
```

## ✅ Checklist de validation

### Pour CHAQUE base Notion :
- [ ] Tous les champs mappés
- [ ] Toutes les relations recréées
- [ ] Tous les rollups reproduits
- [ ] Toutes les vues disponibles
- [ ] Toutes les automatisations migrées
- [ ] Toutes les permissions appliquées
- [ ] Performance testée (<100ms)
- [ ] Documentation complète

## 🚀 Prochaine étape

1. **Valider ce mapping avec vous**
2. **Commencer par 1 module test**
3. **Migrer progressivement**
4. **Tester à chaque étape**
5. **Documenter les décisions**

**AUCUNE action sans votre validation explicite.**
