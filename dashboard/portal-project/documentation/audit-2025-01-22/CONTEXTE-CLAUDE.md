# CONTEXTE CLAUDE - Dashboard Multi-Rôles Portal
**Dernière mise à jour**: 22 janvier 2025

## 🎯 PROJET: Dashboard Multi-Rôles avec Intégration Notion MCP

### Vue d'ensemble
Système de gestion complet avec 4 espaces distincts (Client, Prestataire, Revendeur, SuperAdmin) utilisant Tabler.io v1.0.0-beta20 et intégré à Notion via MCP pour données temps réel.

### Architecture
- **Frontend**: HTML statique + Vanilla JS (pas de framework)
- **UI**: Tabler.io v1.0.0-beta20
- **Backend**: Notion API via MCP
- **Localisation**: Interface française, formatage CHF suisse

## 📁 STRUCTURE PROJET
```
portal-project/
├── assets/js/
│   ├── Client/ (11 modules -notion.js)
│   ├── Prestataire/ (14 modules -notion.js)  
│   ├── Revendeur/ (11 modules -notion.js)
│   └── Superadmin/ (10 modules -notion.js)
├── client/ (14 pages HTML)
├── prestataire/ (15 pages HTML)
├── revendeur/ (12 pages HTML)
└── superadmin/ (31 pages HTML)
```

## 🔑 BASES NOTION CONNECTÉES

### Production (avec IDs réels)
```javascript
// Client/Prestataire/Revendeur
DB_PROJETS_CLIENTS = "226adb95-3c6f-806e-9e61-e263baf7af69"
DB_UTILISATEURS = "236adb95-3c6f-807f-9ea9-d08076830f7c"
DB_TÂCHES = "227adb95-3c6f-8047-b7c1-e7d309071682"
DB_DOCUMENTS = "230adb95-3c6f-80eb-9903-ff117c2a518f"
DB_DEVIS_FACTURES = "226adb95-3c6f-8011-a9bb-ca31f7da8e6a"
DB_MISSIONS_PRESTATAIRE = "236adb95-3c6f-80ca-a317-c7ff9dc7153c"

// SuperAdmin (placeholders à remplacer)
DB_FACTURES_IN = "[ID de la base]"
DB_NOTES_FRAIS = "[ID de la base]"
DB_ECRITURES_COMPTABLES = "[ID de la base]"
DB_TVA_DECLARATIONS = "[ID de la base]"
DB_TRANSACTIONS_BANCAIRES = "[ID de la base]"
```

## ⚡ PATTERNS CRITIQUES

### 1. Intégration Notion MCP
```javascript
// Pattern standard pour tous les modules
async function loadData() {
    if (typeof mcp_notion === 'undefined') {
        return loadMockData(); // Fallback
    }
    const response = await mcp_notion.query_database({
        database_id: DB_ID,
        sorts: [{ property: "Date", direction: "descending" }]
    });
    return response.results.map(transformNotionToLocal);
}
```

### 2. Formatage Suisse CHF
```javascript
// TOUJOURS utiliser ce format pour les montants
function formatSwissAmount(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
// Exemple: 1234.56 → "CHF 1'234.56"
```

### 3. TVA Suisse
- **Normal**: 8.1% (TVA_RATE_NORMAL)
- **Réduit**: 2.6% (TVA_RATE_REDUCED) 
- **Hébergement**: 3.8% (TVA_RATE_LODGING)

### 4. Validation Factures
- < 5'000 CHF: Validation automatique
- 5'000-20'000 CHF: Validation manager
- > 20'000 CHF: Validation CEO

## 🚨 POINTS D'ATTENTION

### À NE JAMAIS FAIRE
- ❌ Créer des fichiers MD non demandés
- ❌ Modifier les IDs de bases Notion en production
- ❌ Utiliser d'autres formats que CHF X'XXX.XX
- ❌ Ignorer le fallback si mcp_notion indisponible
- ❌ Commiter sans demande explicite de l'utilisateur

### À TOUJOURS FAIRE
- ✅ Vérifier existence mcp_notion avant utilisation
- ✅ Utiliser modules -notion.js pour données temps réel
- ✅ Respecter architecture modulaire existante
- ✅ Maintenir interface 100% française
- ✅ Tester avec mock data si Notion indisponible

## 🛠️ WORKFLOWS COMPLEXES

### 1. OCR → Comptabilité
```
1. Upload document → ocr-upload.html
2. OCR extraction → ocr-processor.js
3. Catégorisation automatique
4. Sauvegarde Notion (DB_FACTURES_IN ou DB_NOTES_FRAIS)
5. Génération écriture comptable → accounting-engine.js
6. Mise à jour TVA → vat-calculator.js
```

### 2. Pipeline Commercial
```
1. Lead création → DB_SALES_PIPELINE
2. Attribution territoire automatique
3. Calcul commission → commissions-notion.js
4. Notification commerciaux
5. Dashboard CEO mise à jour
```

## 📊 MODULES SUPERADMIN CRITIQUES

### Finance (100% Notion)
- **invoices-in-notion.js**: Factures fournisseurs
- **expenses-notion.js**: Notes de frais
- **invoices-out-notion.js**: Factures clients
- **accounting-engine.js**: Écritures comptables

### Système
- **ocr-processor.js**: OCR + catégorisation
- **vat-calculator.js**: Calculs TVA suisses
- **dashboard-ceo.js**: Vue consolidée
- **production-tests.js**: Tests automatisés

## 🔧 COMMANDES UTILES

### Tests
```bash
# Depuis portal-project/assets/js/Core/
node production-tests.js
```

### Vérification intégration
```javascript
// Console navigateur
await window.testNotionIntegration();
```

## 💡 CONSEILS DÉVELOPPEMENT

1. **Toujours partir de l'existant**: Analyser modules similaires avant modification
2. **Respect des conventions**: -notion.js pour modules avec données
3. **Gestion d'erreurs**: Try/catch systématique sur appels Notion
4. **Performance**: Cache 60s sur requêtes Notion
5. **Tests**: Utiliser production-tests.js pour validation

## 🎯 PRIORITÉS ACTUELLES

1. ✅ Intégration Notion 100% complète
2. ✅ Tests production créés et fonctionnels
3. ✅ Dashboard CEO opérationnel
4. ⏳ Automatisations n8n à configurer
5. 🔄 Remplacement IDs placeholders SuperAdmin

---

**IMPORTANT**: Ce contexte contient l'essentiel pour travailler efficacement sur le projet. Pour détails spécifiques, consulter AUDIT-INFRASTRUCTURE.md et COMPTE-RENDU-DEVELOPPEMENT.md