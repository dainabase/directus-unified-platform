# 🚀 Contexte : Migration OCR vers OpenAI Vision + Intégration Notion

## Vue d'ensemble du projet

Ce document décrit la migration complète du système OCR du Dashboard SuperAdmin, passant de **Tesseract.js** (lent, 30-45s) à **OpenAI Vision API** (rapide, <15s) avec mapping intelligent vers les bases de données Notion.

## 🏗️ Architecture technique

### Avant (Tesseract.js)
```
Document PDF/Image → PDF.js → Tesseract.js → Regex/Heuristiques → Extraction basique
                      ↓           ↓              ↓                    ↓
                  Conversion   30-45 sec    Précision 75%      Pas de mapping
```

### Après (OpenAI Vision)
```
Document PDF/Image → PDF.js (si PDF) → OpenAI Vision → Mapping Notion → Sauvegarde auto
                         ↓                  ↓              ↓                ↓
                    Conversion image     10-15 sec    Précision 95%    4 types de docs
```

## 📁 Structure des fichiers modifiés/créés

### Frontend (Nouveaux fichiers)
```
/assets/js/Superadmin/
├── ocr-openai-vision.js      # Module principal OpenAI Vision (708 lignes)
├── ocr-cache-manager.js       # Gestion cache LRU (271 lignes) 
├── ocr-error-handler.js       # Gestion erreurs robuste (440 lignes)
├── ocr-progress-manager.js    # UI progression non-bloquante (522 lignes)
└── ocr-memory-manager.js      # Prévention fuites mémoire (479 lignes)

/superadmin/finance/
├── ocr-upload-v2.html         # Nouvelle interface Vision AI (876 lignes)
└── test-ocr-hypervisual.html  # Page test document HYPERVISUAL (536 lignes)
```

### Backend (Service Node.js)
```
/ocr-service/src/
├── services/
│   └── ocr-vision.service.js  # Service OpenAI Vision (396 lignes)
└── routes/
    └── ocr-vision.routes.js   # Routes API Vision (267 lignes)
```

## 🔑 Configuration OpenAI

### Modèles disponibles (Juillet 2024)
- **`gpt-4o-mini`** : Modèle par défaut, rapide et économique ($0.15/1M tokens) ✅
- **`gpt-4o`** : Haute précision pour documents complexes ($5.00/1M tokens)
- ~~`gpt-4-vision-preview`~~ : DÉPRÉCIÉ, ne plus utiliser

### Configuration requise
```javascript
// Frontend (localStorage)
localStorage.setItem('openai_api_key', 'sk-...');
localStorage.setItem('openai_model', 'gpt-4o-mini'); // Optionnel

// Backend (.env)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## 📊 Schémas Notion (4 types de documents)

### 1. FACTURE_FOURNISSEUR
- **DB ID**: `237adb95-3c6f-80de-9f92-c795334e5561`
- **Détection**: Quand HYPERVISUAL est le destinataire
- **Champs**: Numéro, Fournisseur, Date, Montant TTC, Devise, TVA

### 2. FACTURE_CLIENT 
- **DB ID**: `226adb95-3c6f-8011-a9bb-ca31f7da8e6a`
- **Détection**: Quand HYPERVISUAL/DAINAMICS/ENKI REALITY est l'émetteur
- **Champs**: Numéro, Client, Date émission, Montant TTC, Statut

### 3. CONTRAT
- **DB ID**: `22eadb95-3c6f-8099-81fe-d4890db02d9c`
- **Détection**: Mots-clés "contrat", "agreement"
- **Champs**: Nom contrat, Partie contractante, Valeur, Dates

### 4. NOTE_FRAIS
- **DB ID**: `237adb95-3c6f-804b-a530-e44d07ac9f7b`
- **Détection**: Mots-clés "restaurant", "taxi", "frais"
- **Champs**: Description, Montant, Date, Employé

## 🔄 Flux de traitement

### 1. Upload & Validation
```javascript
// Formats supportés : PDF, JPG, PNG, WEBP (max 20MB)
// PDF → Conversion automatique en image via PDF.js
```

### 2. Traitement Vision AI
```javascript
// Prompt intelligent avec contexte des schémas Notion
// Détection automatique du type de document
// Extraction structurée avec mapping des champs
```

### 3. Résultat type
```json
{
  "document_type": "FACTURE_CLIENT",
  "confidence": 0.95,
  "extracted_data": {
    "numero": "AN-00094",
    "client": {
      "nom": "PROMIDEA SRL",
      "adresse": "Via Alessandro Manzoni, 15, 20121 Milano",
      "pays": "Italy"
    },
    "montant_ttc": 3264.62,
    "devise": "EUR",
    "date_emission": "2025-07-21"
  },
  "notion_mapping": {
    "database_id": "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
    "mapped_fields": {
      "Numéro": "AN-00094",
      "Client": "PROMIDEA SRL",
      "Montant TTC": 3264.62
    }
  }
}
```

## ⚡ Points clés pour l'implémentation

### Conversion PDF obligatoire
OpenAI Vision ne lit pas directement les PDFs. Solution implémentée :
- PDF.js extrait la première page
- Conversion en JPEG 85% qualité
- Résolution optimisée (max 2048px)

### Gestion des erreurs
- Rate limiting OpenAI (429) → Retry après 60s
- Timeout 30s par document
- Fallback possible sur Tesseract si échec

### Cache intelligent
- Cache LRU des résultats (évite re-traitement)
- TTL 1h par défaut
- Clé basée sur hash SHA256 du fichier

### Détection intelligente du type
```
Si émetteur = HYPERVISUAL → FACTURE_CLIENT
Si destinataire = HYPERVISUAL → FACTURE_FOURNISSEUR
Analyse mots-clés pour autres types
```

## 🧪 Test avec document HYPERVISUAL

Document test : Facture HYPERVISUAL → PROMIDEA
- **Type attendu** : FACTURE_CLIENT ✅
- **Client extrait** : "PROMIDEA SRL" (nom complet) ✅
- **Montant** : €3,264.62 ✅
- **Temps** : ~10-12 secondes ✅

## 📈 Métriques de performance

| Métrique | Tesseract.js | OpenAI Vision | Amélioration |
|----------|--------------|---------------|--------------|
| Temps moyen | 30-45s | 10-15s | **-67%** |
| Précision | 75% | 95% | **+27%** |
| Détection type | Manuel | Automatique | **∞** |
| Coût/document | ~$0.001 | ~$0.002 | Acceptable |

## 🔗 Endpoints API

### Frontend → Backend
```
POST /api/ocr/vision/process     # Document unique
POST /api/ocr/vision/batch       # Lot de documents
GET  /api/ocr/vision/status      # Statut service
GET  /api/ocr/vision/schemas     # Schémas Notion
```

### Backend → OpenAI
```
POST https://api.openai.com/v1/chat/completions
Model: gpt-4o-mini
Max tokens: 4096
Temperature: 0.1
```

### Backend → Notion (à implémenter)
```
POST https://api.notion.com/v1/pages
Database: [selon type document]
Properties: [mapping automatique]
```

## 🚨 Points d'attention

1. **Clé API OpenAI obligatoire** - Sans clé, pas d'OCR
2. **PDF.js requis** - Pour conversion PDF → Image
3. **Limite 20MB** - Taille max des fichiers
4. **Rate limits** - Max 500 req/min sur OpenAI
5. **Coûts** - ~$0.002 par document avec gpt-4o-mini

## 📝 TODO pour finalisation

- [ ] Implémenter l'envoi réel vers Notion API
- [ ] Ajouter authentification sur les routes
- [ ] Monitoring des coûts OpenAI
- [ ] Interface de configuration des schémas
- [ ] Export des résultats en CSV/Excel

---

*Document créé le 26/07/2025 pour partage avec Claude*
*Projet : Dashboard SuperAdmin - Portal Multi-Rôles*