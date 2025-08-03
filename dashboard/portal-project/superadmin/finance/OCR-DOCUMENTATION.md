# 📄 Documentation OCR Vision Premium

## Vue d'ensemble

Le système OCR Vision Premium est une solution complète d'extraction intelligente de documents avec intégration Notion. Il utilise GPT-4 Vision pour analyser automatiquement vos documents et les sauvegarder dans les bonnes bases de données Notion.

## 🚀 Démarrage rapide

### 1. Configuration initiale

1. **Clé API OpenAI**
   - Obtenez votre clé sur [platform.openai.com](https://platform.openai.com)
   - Format: `sk-...`
   - Modèles supportés: `gpt-4o-mini` (rapide) ou `gpt-4o` (précis)

2. **Clé API Notion**
   - Créez une intégration sur [notion.so/my-integrations](https://notion.so/my-integrations)
   - Format: `secret_...`
   - Partagez vos bases de données avec l'intégration

### 2. Utilisation

1. Accédez à l'interface OCR depuis le menu Finance > OCR Premium
2. Glissez votre document (PDF, JPG, PNG)
3. L'IA analyse et détecte automatiquement le type
4. Vérifiez et corrigez les données si nécessaire
5. Envoyez vers Notion en un clic

## 📊 Types de documents supportés

### 1. FACTURE_CLIENT
- **Détection**: Émetteur = HYPERVISUAL, DAINAMICS, ENKI REALITY, TAKEOUT, LEXAIA
- **Database**: DB-FACTURES-CLIENTS
- **ID**: `226adb95-3c6f-8011-a9bb-ca31f7da8e6a`

### 2. FACTURE_FOURNISSEUR
- **Détection**: Destinataire = entités du groupe
- **Database**: DB-FACTURES-FOURNISSEURS
- **ID**: `237adb95-3c6f-80de-9f92-c795334e5561`

### 3. NOTE_FRAIS
- **Détection**: Mots-clés (restaurant, taxi, hôtel, transport, frais)
- **Database**: DB-NOTES-FRAIS
- **ID**: `237adb95-3c6f-804b-a530-e44d07ac9f7b`

### 4. CONTRAT
- **Détection**: Mots-clés (contrat, agreement, accord)
- **Database**: DB-CONTRATS
- **ID**: `22eadb95-3c6f-8099-81fe-d4890db02d9c`

### 5. TRANSACTION_BANCAIRE
- **Détection**: Mots-clés (virement, carte, banque)
- **Database**: DB-TRANSACTIONS-BANCAIRES
- **ID**: `237adb95-3c6f-803c-9ead-e6156b991db4`

### 6. DOCUMENT_GENERAL
- **Détection**: Par défaut si aucun autre type
- **Database**: DB-DOCUMENTS-GENERAUX
- **ID**: `230adb95-3c6f-80eb-9903-ff117c2a518f`

## 🔧 Architecture technique

### Modules JavaScript

1. **ocr-vision-final.js**
   - Gestion OpenAI Vision API
   - Conversion PDF → Image
   - Extraction avec prompt intelligent

2. **ocr-templates-final.js**
   - 6 templates de documents
   - Mapping des champs
   - Validation des données

3. **ocr-notion-integration.js**
   - API Notion
   - Création de pages
   - Gestion des propriétés

4. **ocr-interface-final.js**
   - Interface utilisateur
   - Workflow complet
   - Gestion des états

### Workflow

```
Upload → OCR Vision → Détection Type → Extraction → Validation → Notion
```

## 🧪 Tests

### Test unitaire
- `/superadmin/finance/test-ocr-final.html`
- Vérification des composants

### Test complet
- `/superadmin/finance/test-ocr-complete.html`
- Test du workflow entier
- Vérification Notion

## 🛠️ Dépannage

### Erreur "Clé API invalide"
- Vérifiez le format de la clé
- OpenAI: `sk-...`
- Notion: `secret_...`

### Document non détecté
- Vérifiez la qualité de l'image
- Le texte doit être lisible
- Format supporté (PDF, JPG, PNG)

### Erreur Notion
- Vérifiez que l'intégration a accès aux databases
- Vérifiez les IDs des databases

## 📈 Optimisations

### Performance
- Utiliser `gpt-4o-mini` pour la rapidité
- Images max 20MB
- PDF première page uniquement

### Précision
- Utiliser `gpt-4o` pour plus de précision
- Vérifier les données avant envoi
- Corriger dans le formulaire si nécessaire

## 🔐 Sécurité

- Les clés API sont stockées localement
- Pas de données sensibles en transit
- HTTPS requis en production

## 📞 Support

Pour toute question ou problème:
1. Consultez les logs dans la console
2. Utilisez la page de test complet
3. Vérifiez la configuration des APIs