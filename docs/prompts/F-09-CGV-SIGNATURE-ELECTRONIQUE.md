# PROMPT 9/10 - MODULE CGV & SIGNATURE ÉLECTRONIQUE

## Contexte
Ce module gère les Conditions Générales de Vente (CGV), les Conditions Générales de Location (CGL) et l'intégration de la signature électronique conformément au droit suisse (SCSE/ZertES RS 943.03).

## Cadre Légal Suisse Applicable

### Signature Électronique (4 niveaux)
- **SES** (Simple) : Nom tapé, case cochée - valable pour CGV
- **AES** (Avancée) : Lien unique signataire - contrats B2B
- **QES** (Qualifiée) : Équivalent manuscrite (art. 14 al. 2bis CO) - bail, cautionnement
- **Horodatage qualifié** : Obligatoire avec QES

### Prestataires QES reconnus en Suisse
- Swisscom AG
- SwissSign AG
- QuoVadis Trustlink Schweiz AG (DigiCert)

### Acceptation Électronique CGV
- **Aucune signature requise** pour les CGV
- Case à cocher ou click-wrap suffit légalement
- CGV doivent être accessibles AVANT conclusion du contrat
- Possibilité de téléchargement obligatoire

### Mentions Obligatoires CGV Suisses
- Raison sociale, adresse, numéro IDE
- Conditions de paiement (délais, TVA 8.1%, intérêts de retard)
- Conditions de livraison et garantie (2 ans minimum B2C)
- Droit applicable et for juridique
- Pour e-commerce (art. 3(1)(s) LCD) : email, étapes techniques, confirmation commande

### Clauses Interdites (art. 8 LCD)
- Exclusion responsabilité pour faute grave/dol (art. 100 CO)
- Modifications unilatérales sans préavis
- Clauses pénales disproportionnées (>20% scruté)
- Clauses insolites non signalées (Ungewöhnlichkeitsregel)

### Conditions de Location (art. 253-274g CO)
- Formulaires officiels cantonaux pour résiliation bail habitation
- Délais préavis : 3 mois (habitation), 6 mois (commercial)
- Dépôt garantie : max 3 mois de loyer (habitation)
- Clauses accessoires nulles (art. 254 CO)

## Structure du Module

### Fichiers à créer
```
src/backend/services/legal/
├── cgv.service.js              # Service CGV/CGL
├── signature.service.js        # Intégration signature électronique
├── documents-legal.service.js  # Génération documents légaux
└── index.js                    # Export du module

src/backend/api/legal/
├── legal.routes.js             # Endpoints API
└── index.js

src/frontend/src/portals/superadmin/legal/
├── components/
│   ├── CGVEditor.jsx           # Éditeur CGV avec prévisualisation
│   ├── SignaturePanel.jsx      # Interface signature électronique
│   ├── CGVAcceptance.jsx       # Composant acceptation client
│   └── DocumentHistory.jsx     # Historique versions CGV
├── hooks/
│   └── useLegalDocuments.js
├── services/
│   └── legalApi.js
└── LegalDashboard.jsx
```

## Fichier 1: cgv.service.js

```javascript
/**
 * Service CGV/CGL - Conforme Droit Suisse
 * 
 * Gère les Conditions Générales de Vente et de Location
 * selon les articles du Code des Obligations et LCD
 */

import directus from '../../config/directus.js';

// Entreprises du groupe
const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Types de documents légaux
const DOCUMENT_TYPES = {
  CGV_VENTE: 'cgv_vente',           // Conditions Générales de Vente
  CGL_LOCATION: 'cgl_location',     // Conditions Générales de Location
  CGV_SERVICE: 'cgv_service',       // Conditions Générales de Service
  DEVIS: 'devis',                   // Devis avec CGV
  CONTRAT_PRESTATION: 'contrat_prestation',
  CONTRAT_LOCATION: 'contrat_location'
};

// Niveaux de signature requis par type de document
const SIGNATURE_REQUIREMENTS = {
  cgv_vente: 'SES',           // Simple (case à cocher)
  cgl_location: 'QES',        // Qualifiée (bail)
  cgv_service: 'SES',
  devis: 'AES',               // Avancée
  contrat_prestation: 'AES',
  contrat_location: 'QES'     // Qualifiée obligatoire
};

// Clauses obligatoires par type
const MANDATORY_CLAUSES = {
  cgv_vente: [
    'identification_vendeur',     // Raison sociale, adresse, IDE
    'objet_vente',
    'prix_paiement',              // Délais, TVA 8.1%, intérêts retard
    'livraison',
    'garantie_legale',            // 2 ans minimum B2C
    'responsabilite',
    'droit_applicable',           // Droit suisse
    'for_juridique',              // Tribunal compétent
    'protection_donnees'          // LPD
  ],
  cgl_location: [
    'identification_bailleur',
    'objet_location',
    'duree_location',
    'loyer_charges',
    'depot_garantie',             // Max 3 mois
    'entretien_reparations',
    'resiliation',                // Délais légaux
    'restitution',
    'droit_applicable',
    'for_juridique'
  ],
  cgv_service: [
    'identification_prestataire',
    'objet_prestation',
    'prix_paiement',
    'delais_execution',
    'responsabilite',
    'confidentialite',
    'propriete_intellectuelle',
    'droit_applicable',
    'for_juridique',
    'protection_donnees'
  ]
};

// Clauses interdites (art. 8 LCD)
const FORBIDDEN_CLAUSES = [
  'exclusion_responsabilite_faute_grave',
  'exclusion_responsabilite_dol',
  'modification_unilaterale_sans_preavis',
  'penalite_disproportionnee',
  'renonciation_droits_consommateur',
  'reduction_garantie_legale_b2c'
];

class CGVService {
  constructor() {
    this.directus = directus;
  }

  /**
   * Créer un nouveau document CGV/CGL
   */
  async createCGV(data) {
    const {
      owner_company,
      document_type,
      version,
      effective_date,
      content,
      clauses,
      language = 'fr'
    } = data;

    // Validation entreprise
    if (!COMPANIES.includes(owner_company)) {
      throw new Error(`Entreprise invalide: ${owner_company}`);
    }

    // Validation type document
    if (!DOCUMENT_TYPES[document_type.toUpperCase()]) {
      throw new Error(`Type de document invalide: ${document_type}`);
    }

    // Vérification clauses obligatoires
    const missingClauses = this.validateMandatoryClauses(document_type, clauses);
    if (missingClauses.length > 0) {
      throw new Error(`Clauses obligatoires manquantes: ${missingClauses.join(', ')}`);
    }

    // Vérification clauses interdites
    const forbiddenFound = this.checkForbiddenClauses(clauses);
    if (forbiddenFound.length > 0) {
      throw new Error(`Clauses interdites détectées: ${forbiddenFound.join(', ')}`);
    }

    // Désactiver l'ancienne version active
    await this.deactivatePreviousVersion(owner_company, document_type);

    // Créer le document
    const cgvDocument = await this.directus.items('cgv_documents').createOne({
      owner_company,
      document_type,
      version,
      effective_date,
      content,
      clauses: JSON.stringify(clauses),
      language,
      status: 'active',
      signature_level_required: SIGNATURE_REQUIREMENTS[document_type],
      created_at: new Date().toISOString(),
      created_by: 'system'
    });

    // Log pour audit
    await this.logCGVEvent('cgv_created', cgvDocument.id, owner_company, {
      version,
      document_type
    });

    return cgvDocument;
  }

  /**
   * Valider les clauses obligatoires
   */
  validateMandatoryClauses(documentType, clauses) {
    const required = MANDATORY_CLAUSES[documentType] || [];
    const providedKeys = Object.keys(clauses || {});
    
    return required.filter(clause => !providedKeys.includes(clause));
  }

  /**
   * Vérifier les clauses interdites
   */
  checkForbiddenClauses(clauses) {
    if (!clauses) return [];
    
    const clauseContent = JSON.stringify(clauses).toLowerCase();
    const found = [];

    // Patterns de clauses interdites
    const patterns = {
      'exclusion_responsabilite_faute_grave': /exclu.*responsabilit.*faute.*grave/i,
      'exclusion_responsabilite_dol': /exclu.*responsabilit.*dol/i,
      'modification_unilaterale_sans_preavis': /modifi.*unilat.*sans.*préavis|sans.*information.*préalabl/i,
      'reduction_garantie_legale_b2c': /garantie.*inférieur.*2.*an|garantie.*1.*an/i
    };

    for (const [clauseName, pattern] of Object.entries(patterns)) {
      if (pattern.test(clauseContent)) {
        found.push(clauseName);
      }
    }

    return found;
  }

  /**
   * Désactiver les versions précédentes
   */
  async deactivatePreviousVersion(ownerCompany, documentType) {
    const activeDocuments = await this.directus.items('cgv_documents').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        document_type: { _eq: documentType },
        status: { _eq: 'active' }
      }
    });

    for (const doc of activeDocuments.data || []) {
      await this.directus.items('cgv_documents').updateOne(doc.id, {
        status: 'archived',
        archived_at: new Date().toISOString()
      });
    }
  }

  /**
   * Obtenir le CGV actif pour une entreprise
   */
  async getActiveCGV(ownerCompany, documentType, language = 'fr') {
    const result = await this.directus.items('cgv_documents').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        document_type: { _eq: documentType },
        status: { _eq: 'active' },
        language: { _eq: language }
      },
      sort: ['-effective_date'],
      limit: 1
    });

    return result.data?.[0] || null;
  }

  /**
   * Enregistrer l'acceptation CGV par un client
   */
  async recordCGVAcceptance(data) {
    const {
      cgv_document_id,
      client_id,
      acceptance_method,  // 'checkbox', 'click_wrap', 'signature'
      ip_address,
      user_agent,
      timestamp
    } = data;

    // Récupérer le document CGV
    const cgvDocument = await this.directus.items('cgv_documents').readOne(cgv_document_id);
    if (!cgvDocument) {
      throw new Error('Document CGV non trouvé');
    }

    // Vérifier que le client existe
    const client = await this.directus.items('people').readOne(client_id);
    if (!client) {
      throw new Error('Client non trouvé');
    }

    // Créer l'enregistrement d'acceptation
    const acceptance = await this.directus.items('cgv_acceptances').createOne({
      cgv_document_id,
      client_id,
      owner_company: cgvDocument.owner_company,
      document_type: cgvDocument.document_type,
      document_version: cgvDocument.version,
      acceptance_method,
      acceptance_timestamp: timestamp || new Date().toISOString(),
      ip_address,
      user_agent,
      is_valid: true,
      // Données pour preuve légale
      proof_hash: this.generateProofHash({
        cgv_document_id,
        client_id,
        timestamp,
        ip_address
      })
    });

    // Log pour audit
    await this.logCGVEvent('cgv_accepted', cgv_document_id, cgvDocument.owner_company, {
      client_id,
      acceptance_method,
      acceptance_id: acceptance.id
    });

    return acceptance;
  }

  /**
   * Générer un hash de preuve pour l'acceptation
   */
  generateProofHash(data) {
    const crypto = require('crypto');
    const content = JSON.stringify(data) + process.env.CGV_PROOF_SECRET;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Vérifier si un client a accepté les CGV actuels
   */
  async hasClientAcceptedCGV(clientId, ownerCompany, documentType) {
    const activeCGV = await this.getActiveCGV(ownerCompany, documentType);
    if (!activeCGV) return false;

    const acceptance = await this.directus.items('cgv_acceptances').readByQuery({
      filter: {
        client_id: { _eq: clientId },
        cgv_document_id: { _eq: activeCGV.id },
        is_valid: { _eq: true }
      },
      limit: 1
    });

    return (acceptance.data?.length || 0) > 0;
  }

  /**
   * Générer le contenu CGV avec les données de l'entreprise
   */
  async generateCGVContent(ownerCompany, documentType, customData = {}) {
    // Récupérer les informations de l'entreprise
    const company = await this.directus.items('companies').readByQuery({
      filter: { name: { _eq: ownerCompany } },
      limit: 1
    });

    const companyData = company.data?.[0];
    if (!companyData) {
      throw new Error(`Entreprise non trouvée: ${ownerCompany}`);
    }

    // Template de base selon le type
    const template = this.getCGVTemplate(documentType);

    // Remplacer les variables
    const content = this.replaceTemplateVariables(template, {
      company_name: companyData.name,
      company_address: companyData.address,
      company_ide: companyData.ide_number,
      company_email: companyData.email,
      company_phone: companyData.phone,
      vat_rate: '8.1%',                           // Taux TVA 2025
      interest_rate: '5%',                        // Taux intérêts moratoires légal
      warranty_period: '2 ans',                   // Garantie légale B2C
      payment_delay: customData.payment_delay || '30 jours',
      jurisdiction: customData.jurisdiction || 'Genève',
      ...customData
    });

    return content;
  }

  /**
   * Obtenir le template CGV selon le type
   */
  getCGVTemplate(documentType) {
    const templates = {
      cgv_vente: this.getVenteCGVTemplate(),
      cgl_location: this.getLocationCGLTemplate(),
      cgv_service: this.getServiceCGVTemplate()
    };

    return templates[documentType] || templates.cgv_vente;
  }

  /**
   * Template CGV de Vente
   */
  getVenteCGVTemplate() {
    return `
# CONDITIONS GÉNÉRALES DE VENTE

## Article 1 - Identification du vendeur
**{{company_name}}**
{{company_address}}
Numéro IDE: {{company_ide}}
Email: {{company_email}}
Téléphone: {{company_phone}}

## Article 2 - Objet
Les présentes Conditions Générales de Vente (ci-après "CGV") régissent les relations contractuelles entre {{company_name}} (ci-après "le Vendeur") et toute personne physique ou morale (ci-après "l'Acheteur") effectuant un achat.

## Article 3 - Prix et paiement
3.1 Les prix sont indiqués en CHF, TVA de {{vat_rate}} incluse.
3.2 Le paiement est dû dans un délai de {{payment_delay}} à compter de la date de facturation.
3.3 En cas de retard de paiement, des intérêts moratoires de {{interest_rate}} par an seront appliqués conformément à l'art. 104 CO.

## Article 4 - Livraison
Les conditions de livraison sont définies au moment de la commande. Les délais indiqués ne sont pas garantis et ne donnent pas lieu à indemnisation en cas de dépassement raisonnable.

## Article 5 - Garantie
Conformément aux art. 197ss CO, le Vendeur garantit les produits contre tout défaut de fabrication pendant une période de {{warranty_period}} à compter de la livraison.

## Article 6 - Responsabilité
Le Vendeur ne saurait être tenu responsable des dommages indirects ou consécutifs. Sa responsabilité est limitée au montant de la commande concernée.

## Article 7 - Protection des données
Les données personnelles sont traitées conformément à la Loi fédérale sur la protection des données (LPD).

## Article 8 - Droit applicable et for juridique
Les présentes CGV sont soumises au droit suisse. Tout litige sera soumis à la compétence exclusive des tribunaux de {{jurisdiction}}.

**Version: {{version}} - Date d'effet: {{effective_date}}**
`;
  }

  /**
   * Template CGL de Location
   */
  getLocationCGLTemplate() {
    return `
# CONDITIONS GÉNÉRALES DE LOCATION

## Article 1 - Identification du bailleur
**{{company_name}}**
{{company_address}}
Numéro IDE: {{company_ide}}

## Article 2 - Objet de la location
Les présentes Conditions Générales de Location (ci-après "CGL") définissent les termes et conditions applicables aux contrats de location conclus avec {{company_name}}.

## Article 3 - Durée et résiliation
3.1 La durée de location est définie dans le contrat spécifique.
3.2 Le délai de résiliation est de 3 mois pour les locaux d'habitation et 6 mois pour les locaux commerciaux, conformément aux art. 266a-266o CO.
3.3 La résiliation doit être notifiée par écrit sur le formulaire officiel cantonal pour les baux d'habitation.

## Article 4 - Loyer et charges
4.1 Le loyer et les charges sont payables d'avance le premier jour de chaque mois.
4.2 Les charges sont détaillées dans le contrat et font l'objet d'un décompte annuel.

## Article 5 - Dépôt de garantie
Le dépôt de garantie est fixé à {{deposit_amount}} (maximum 3 mois de loyer conformément à l'art. 257e CO) et sera déposé sur un compte bloqué auprès d'une banque suisse.

## Article 6 - Entretien et réparations
Le locataire est responsable du petit entretien. Les réparations importantes incombent au bailleur conformément à l'art. 256 CO.

## Article 7 - Restitution
À la fin du bail, le locataire restituera les locaux dans l'état initial, usure normale exceptée. Un état des lieux sera effectué contradictoirement.

## Article 8 - Droit applicable et for juridique
Les présentes CGL sont soumises au droit suisse. Le for juridique est {{jurisdiction}}.

**Version: {{version}} - Date d'effet: {{effective_date}}**
`;
  }

  /**
   * Template CGV de Service
   */
  getServiceCGVTemplate() {
    return `
# CONDITIONS GÉNÉRALES DE SERVICE

## Article 1 - Identification du prestataire
**{{company_name}}**
{{company_address}}
Numéro IDE: {{company_ide}}
Email: {{company_email}}

## Article 2 - Objet
Les présentes Conditions Générales de Service régissent la fourniture de services par {{company_name}}.

## Article 3 - Prix et paiement
3.1 Les prix sont indiqués en CHF, hors TVA ({{vat_rate}}).
3.2 Facturation selon les termes du devis accepté.
3.3 Paiement sous {{payment_delay}}. Intérêts de retard: {{interest_rate}}/an.

## Article 4 - Exécution des services
4.1 Les délais d'exécution sont indicatifs sauf mention contraire.
4.2 Le prestataire s'engage à exécuter ses obligations avec diligence.

## Article 5 - Confidentialité
Les parties s'engagent à traiter comme confidentielles toutes les informations échangées dans le cadre de la collaboration.

## Article 6 - Propriété intellectuelle
Sauf accord contraire, les droits de propriété intellectuelle sur les livrables sont transférés au client après paiement intégral.

## Article 7 - Responsabilité
La responsabilité du prestataire est limitée au montant des honoraires perçus pour la mission concernée.

## Article 8 - Droit applicable et for juridique
Droit suisse applicable. For juridique: {{jurisdiction}}.

**Version: {{version}} - Date d'effet: {{effective_date}}**
`;
  }

  /**
   * Remplacer les variables dans le template
   */
  replaceTemplateVariables(template, variables) {
    let content = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || '');
    }
    return content;
  }

  /**
   * Logger un événement CGV pour audit
   */
  async logCGVEvent(eventType, documentId, ownerCompany, metadata = {}) {
    await this.directus.items('audit_logs').createOne({
      event_type: eventType,
      entity_type: 'cgv_document',
      entity_id: documentId,
      owner_company: ownerCompany,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtenir l'historique des versions CGV
   */
  async getCGVHistory(ownerCompany, documentType) {
    const result = await this.directus.items('cgv_documents').readByQuery({
      filter: {
        owner_company: { _eq: ownerCompany },
        document_type: { _eq: documentType }
      },
      sort: ['-effective_date'],
      fields: ['id', 'version', 'effective_date', 'status', 'created_at', 'archived_at']
    });

    return result.data || [];
  }
}

export const cgvService = new CGVService();
export default cgvService;
```


## Fichier 2: signature.service.js

```javascript
/**
 * Service Signature Électronique - Conforme SCSE/ZertES
 * 
 * Intégration avec les prestataires QES reconnus en Suisse:
 * - Swisscom AG
 * - SwissSign AG
 * - QuoVadis Trustlink (DigiCert)
 */

import directus from '../../config/directus.js';
import crypto from 'crypto';

// Niveaux de signature électronique (SCSE/ZertES)
const SIGNATURE_LEVELS = {
  SES: {
    name: 'Simple Electronic Signature',
    description: 'Signature électronique simple (nom tapé, case cochée)',
    legal_value: 'Minimale - valable sans forme requise',
    use_cases: ['CGV', 'factures', 'protocoles', 'confirmations']
  },
  AES: {
    name: 'Advanced Electronic Signature',
    description: 'Signature électronique avancée avec lien unique au signataire',
    legal_value: 'Renforcée - contrats B2B standards',
    use_cases: ['Contrats B2B', 'NDA', 'devis', 'accords commerciaux']
  },
  QES: {
    name: 'Qualified Electronic Signature',
    description: 'Signature électronique qualifiée avec horodatage',
    legal_value: 'Équivalente à manuscrite (art. 14 al. 2bis CO)',
    use_cases: ['Bail', 'cautionnement', 'cession créance', 'résiliation bail']
  }
};

// Prestataires QES reconnus en Suisse
const QES_PROVIDERS = {
  SWISSCOM: {
    name: 'Swisscom AG',
    api_url: process.env.SWISSCOM_SIGN_API_URL,
    api_key: process.env.SWISSCOM_SIGN_API_KEY,
    supported_levels: ['SES', 'AES', 'QES']
  },
  SWISSSIGN: {
    name: 'SwissSign AG',
    api_url: process.env.SWISSSIGN_API_URL,
    api_key: process.env.SWISSSIGN_API_KEY,
    supported_levels: ['SES', 'AES', 'QES']
  },
  DIGICERT: {
    name: 'QuoVadis Trustlink (DigiCert)',
    api_url: process.env.DIGICERT_API_URL,
    api_key: process.env.DIGICERT_API_KEY,
    supported_levels: ['SES', 'AES', 'QES']
  }
};

// Documents nécessitant obligatoirement une QES
const QES_REQUIRED_DOCUMENTS = [
  'contrat_location_habitation',
  'resiliation_bail',
  'cautionnement',
  'cession_creance',
  'contrat_leasing'
];

class SignatureService {
  constructor() {
    this.directus = directus;
    this.defaultProvider = process.env.DEFAULT_SIGNATURE_PROVIDER || 'SWISSCOM';
  }

  /**
   * Créer une demande de signature
   */
  async createSignatureRequest(data) {
    const {
      document_id,
      document_type,
      owner_company,
      signers,            // [{name, email, role, signature_level}]
      document_content,   // PDF en base64 ou URL
      callback_url,
      deadline,
      message
    } = data;

    // Déterminer le niveau de signature requis
    const requiredLevel = this.getRequiredSignatureLevel(document_type);

    // Valider les signataires
    for (const signer of signers) {
      if (!signer.email || !signer.name) {
        throw new Error('Chaque signataire doit avoir un nom et un email');
      }
      // Vérifier que le niveau demandé est suffisant
      if (this.compareSignatureLevels(signer.signature_level, requiredLevel) < 0) {
        throw new Error(`Le document ${document_type} requiert au minimum une signature ${requiredLevel}`);
      }
    }

    // Créer l'enregistrement de demande
    const signatureRequest = await this.directus.items('signature_requests').createOne({
      document_id,
      document_type,
      owner_company,
      required_level: requiredLevel,
      status: 'pending',
      signers: JSON.stringify(signers),
      document_hash: this.hashDocument(document_content),
      callback_url,
      deadline: deadline || this.getDefaultDeadline(),
      message,
      created_at: new Date().toISOString(),
      provider: this.defaultProvider
    });

    // Initier la demande auprès du prestataire
    const providerResponse = await this.initiateWithProvider(
      signatureRequest.id,
      document_content,
      signers,
      requiredLevel
    );

    // Mettre à jour avec les infos du prestataire
    await this.directus.items('signature_requests').updateOne(signatureRequest.id, {
      provider_request_id: providerResponse.request_id,
      signing_url: providerResponse.signing_url,
      status: 'initiated'
    });

    // Notifier les signataires
    await this.notifySigners(signers, signatureRequest.id, providerResponse.signing_url, message);

    return {
      ...signatureRequest,
      signing_url: providerResponse.signing_url,
      provider_request_id: providerResponse.request_id
    };
  }

  /**
   * Déterminer le niveau de signature requis selon le type de document
   */
  getRequiredSignatureLevel(documentType) {
    if (QES_REQUIRED_DOCUMENTS.includes(documentType)) {
      return 'QES';
    }

    const levelMapping = {
      // Documents simples - SES suffit
      cgv_vente: 'SES',
      cgv_service: 'SES',
      facture: 'SES',
      devis_simple: 'SES',
      protocole: 'SES',
      
      // Documents intermédiaires - AES recommandé
      devis_engagement: 'AES',
      contrat_prestation: 'AES',
      nda: 'AES',
      accord_commercial: 'AES',
      
      // Documents formels - QES obligatoire
      cgl_location: 'QES',
      contrat_location: 'QES',
      bail: 'QES',
      resiliation: 'QES',
      cautionnement: 'QES'
    };

    return levelMapping[documentType] || 'AES';
  }

  /**
   * Comparer les niveaux de signature
   * Retourne: -1 si a < b, 0 si égal, 1 si a > b
   */
  compareSignatureLevels(levelA, levelB) {
    const hierarchy = { 'SES': 1, 'AES': 2, 'QES': 3 };
    return Math.sign((hierarchy[levelA] || 0) - (hierarchy[levelB] || 0));
  }

  /**
   * Initier la demande auprès du prestataire de signature
   */
  async initiateWithProvider(requestId, documentContent, signers, level) {
    const provider = QES_PROVIDERS[this.defaultProvider];
    
    if (!provider || !provider.api_url) {
      // Mode simulation si pas de prestataire configuré
      return this.simulateProviderResponse(requestId, signers);
    }

    // Appel API réel au prestataire
    try {
      const response = await fetch(`${provider.api_url}/signature-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document: documentContent,
          signers: signers.map(s => ({
            name: s.name,
            email: s.email,
            signature_level: level,
            authentication: level === 'QES' ? 'video_ident' : 'email'
          })),
          callback_url: `${process.env.API_BASE_URL}/api/legal/signature/callback`,
          reference: requestId
        })
      });

      const result = await response.json();
      return {
        request_id: result.id,
        signing_url: result.signing_url
      };
    } catch (error) {
      console.error('Erreur prestataire signature:', error);
      throw new Error('Impossible de créer la demande de signature');
    }
  }

  /**
   * Simuler une réponse de prestataire (mode développement)
   */
  simulateProviderResponse(requestId, signers) {
    return {
      request_id: `SIM-${requestId}-${Date.now()}`,
      signing_url: `${process.env.FRONTEND_URL}/sign/${requestId}`
    };
  }

  /**
   * Hasher le document pour vérification d'intégrité
   */
  hashDocument(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Délai par défaut pour signature (14 jours)
   */
  getDefaultDeadline() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    return deadline.toISOString();
  }

  /**
   * Notifier les signataires
   */
  async notifySigners(signers, requestId, signingUrl, message) {
    // Utiliser Mautic pour les notifications
    for (const signer of signers) {
      await this.directus.items('email_queue').createOne({
        to_email: signer.email,
        to_name: signer.name,
        template: 'signature_request',
        subject: 'Document à signer',
        variables: JSON.stringify({
          signer_name: signer.name,
          signing_url: signingUrl,
          message: message,
          deadline: this.getDefaultDeadline()
        }),
        status: 'pending',
        priority: 'high'
      });
    }
  }

  /**
   * Traiter le callback de signature (webhook du prestataire)
   */
  async handleSignatureCallback(data) {
    const {
      provider_request_id,
      signer_email,
      status,         // 'signed', 'declined', 'expired'
      signature_data,
      timestamp
    } = data;

    // Trouver la demande
    const request = await this.directus.items('signature_requests').readByQuery({
      filter: { provider_request_id: { _eq: provider_request_id } },
      limit: 1
    });

    if (!request.data?.[0]) {
      throw new Error('Demande de signature non trouvée');
    }

    const signatureRequest = request.data[0];

    // Enregistrer la signature individuelle
    await this.directus.items('signature_events').createOne({
      signature_request_id: signatureRequest.id,
      signer_email,
      status,
      signature_data: signature_data ? JSON.stringify(signature_data) : null,
      timestamp: timestamp || new Date().toISOString(),
      provider: signatureRequest.provider
    });

    // Mettre à jour le statut des signataires
    const signers = JSON.parse(signatureRequest.signers);
    const updatedSigners = signers.map(s => {
      if (s.email === signer_email) {
        return { ...s, status, signed_at: timestamp };
      }
      return s;
    });

    // Vérifier si tous ont signé
    const allSigned = updatedSigners.every(s => s.status === 'signed');
    const anyDeclined = updatedSigners.some(s => s.status === 'declined');

    let newStatus = 'in_progress';
    if (allSigned) {
      newStatus = 'completed';
    } else if (anyDeclined) {
      newStatus = 'declined';
    }

    // Mettre à jour la demande
    await this.directus.items('signature_requests').updateOne(signatureRequest.id, {
      signers: JSON.stringify(updatedSigners),
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    });

    // Si complété, télécharger le document signé
    if (newStatus === 'completed' && signature_data?.signed_document_url) {
      await this.downloadSignedDocument(signatureRequest.id, signature_data.signed_document_url);
    }

    // Callback vers l'application
    if (signatureRequest.callback_url) {
      await this.callWebhook(signatureRequest.callback_url, {
        request_id: signatureRequest.id,
        status: newStatus,
        document_id: signatureRequest.document_id
      });
    }

    return { status: newStatus, request_id: signatureRequest.id };
  }

  /**
   * Télécharger le document signé
   */
  async downloadSignedDocument(requestId, documentUrl) {
    try {
      const response = await fetch(documentUrl);
      const buffer = await response.buffer();

      // Sauvegarder dans Directus
      await this.directus.items('signed_documents').createOne({
        signature_request_id: requestId,
        document: buffer.toString('base64'),
        filename: `signed_document_${requestId}.pdf`,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur téléchargement document signé:', error);
    }
  }

  /**
   * Appeler un webhook
   */
  async callWebhook(url, data) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Erreur webhook:', error);
    }
  }

  /**
   * Vérifier la validité d'une signature
   */
  async verifySignature(signatureRequestId) {
    const request = await this.directus.items('signature_requests').readOne(signatureRequestId);
    if (!request) {
      throw new Error('Demande de signature non trouvée');
    }

    const events = await this.directus.items('signature_events').readByQuery({
      filter: { signature_request_id: { _eq: signatureRequestId } }
    });

    return {
      is_valid: request.status === 'completed',
      signature_level: request.required_level,
      signers: JSON.parse(request.signers),
      events: events.data,
      document_hash: request.document_hash,
      completed_at: request.completed_at
    };
  }

  /**
   * Obtenir les demandes de signature pour une entreprise
   */
  async getSignatureRequests(ownerCompany, filters = {}) {
    const query = {
      filter: {
        owner_company: { _eq: ownerCompany },
        ...filters
      },
      sort: ['-created_at'],
      limit: filters.limit || 50
    };

    const result = await this.directus.items('signature_requests').readByQuery(query);
    return result.data || [];
  }

  /**
   * Annuler une demande de signature
   */
  async cancelSignatureRequest(requestId) {
    const request = await this.directus.items('signature_requests').readOne(requestId);
    if (!request) {
      throw new Error('Demande non trouvée');
    }

    if (request.status === 'completed') {
      throw new Error('Impossible d\'annuler une demande complétée');
    }

    // Annuler auprès du prestataire si applicable
    if (request.provider_request_id) {
      await this.cancelWithProvider(request.provider_request_id);
    }

    await this.directus.items('signature_requests').updateOne(requestId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    });

    return { success: true };
  }

  /**
   * Annuler auprès du prestataire
   */
  async cancelWithProvider(providerRequestId) {
    const provider = QES_PROVIDERS[this.defaultProvider];
    if (!provider?.api_url) return;

    try {
      await fetch(`${provider.api_url}/signature-requests/${providerRequestId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${provider.api_key}` }
      });
    } catch (error) {
      console.error('Erreur annulation prestataire:', error);
    }
  }
}

export const signatureService = new SignatureService();
export default signatureService;
```

## Fichier 3: src/backend/api/legal/legal.routes.js

```javascript
/**
 * Routes API Module Légal
 * CGV, Signatures, Documents légaux
 */

import express from 'express';
import { cgvService } from '../../services/legal/cgv.service.js';
import { signatureService } from '../../services/legal/signature.service.js';
import { authMiddleware, companyAccessMiddleware } from '../../middleware/auth.js';

const router = express.Router();

// Middleware d'authentification sur toutes les routes
router.use(authMiddleware);

// ==================== ROUTES CGV ====================

/**
 * GET /api/legal/cgv/:company/:type
 * Obtenir le CGV actif pour une entreprise et un type
 */
router.get('/cgv/:company/:type', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type } = req.params;
    const { language = 'fr' } = req.query;

    const cgv = await cgvService.getActiveCGV(company, type, language);
    
    if (!cgv) {
      return res.status(404).json({ error: 'CGV non trouvé' });
    }

    res.json(cgv);
  } catch (error) {
    console.error('Erreur récupération CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv
 * Créer un nouveau document CGV
 */
router.post('/cgv', companyAccessMiddleware, async (req, res) => {
  try {
    const cgv = await cgvService.createCGV(req.body);
    res.status(201).json(cgv);
  } catch (error) {
    console.error('Erreur création CGV:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv/:id/accept
 * Enregistrer l'acceptation d'un CGV par un client
 */
router.post('/cgv/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const acceptance = await cgvService.recordCGVAcceptance({
      cgv_document_id: id,
      ...req.body,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json(acceptance);
  } catch (error) {
    console.error('Erreur acceptation CGV:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/legal/cgv/:company/:type/check/:clientId
 * Vérifier si un client a accepté les CGV actuels
 */
router.get('/cgv/:company/:type/check/:clientId', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type, clientId } = req.params;
    const hasAccepted = await cgvService.hasClientAcceptedCGV(clientId, company, type);
    
    res.json({ has_accepted: hasAccepted });
  } catch (error) {
    console.error('Erreur vérification acceptation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/legal/cgv/:company/:type/history
 * Historique des versions CGV
 */
router.get('/cgv/:company/:type/history', companyAccessMiddleware, async (req, res) => {
  try {
    const { company, type } = req.params;
    const history = await cgvService.getCGVHistory(company, type);
    
    res.json(history);
  } catch (error) {
    console.error('Erreur historique CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/cgv/generate
 * Générer le contenu CGV avec les données de l'entreprise
 */
router.post('/cgv/generate', companyAccessMiddleware, async (req, res) => {
  try {
    const { owner_company, document_type, custom_data } = req.body;
    const content = await cgvService.generateCGVContent(owner_company, document_type, custom_data);
    
    res.json({ content });
  } catch (error) {
    console.error('Erreur génération CGV:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES SIGNATURE ====================

/**
 * POST /api/legal/signature/request
 * Créer une demande de signature
 */
router.post('/signature/request', companyAccessMiddleware, async (req, res) => {
  try {
    const request = await signatureService.createSignatureRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Erreur création demande signature:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/legal/signature/callback
 * Webhook callback du prestataire de signature
 */
router.post('/signature/callback', async (req, res) => {
  try {
    const result = await signatureService.handleSignatureCallback(req.body);
    res.json(result);
  } catch (error) {
    console.error('Erreur callback signature:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/legal/signature/:id/verify
 * Vérifier la validité d'une signature
 */
router.get('/signature/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await signatureService.verifySignature(id);
    
    res.json(verification);
  } catch (error) {
    console.error('Erreur vérification signature:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/legal/signature/:company
 * Liste des demandes de signature pour une entreprise
 */
router.get('/signature/:company', companyAccessMiddleware, async (req, res) => {
  try {
    const { company } = req.params;
    const { status, limit } = req.query;

    const filters = {};
    if (status) filters.status = { _eq: status };
    if (limit) filters.limit = parseInt(limit);

    const requests = await signatureService.getSignatureRequests(company, filters);
    res.json(requests);
  } catch (error) {
    console.error('Erreur liste signatures:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legal/signature/:id/cancel
 * Annuler une demande de signature
 */
router.post('/signature/:id/cancel', companyAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await signatureService.cancelSignatureRequest(id);
    
    res.json(result);
  } catch (error) {
    console.error('Erreur annulation signature:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

## Collections Directus à créer

### Collection: cgv_documents
```json
{
  "collection": "cgv_documents",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "owner_company", "type": "string", "required": true },
    { "field": "document_type", "type": "string", "required": true },
    { "field": "version", "type": "string", "required": true },
    { "field": "effective_date", "type": "date", "required": true },
    { "field": "content", "type": "text" },
    { "field": "clauses", "type": "json" },
    { "field": "language", "type": "string", "default": "fr" },
    { "field": "status", "type": "string", "default": "draft" },
    { "field": "signature_level_required", "type": "string" },
    { "field": "created_at", "type": "timestamp" },
    { "field": "created_by", "type": "string" },
    { "field": "archived_at", "type": "timestamp" }
  ]
}
```

### Collection: cgv_acceptances
```json
{
  "collection": "cgv_acceptances",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "cgv_document_id", "type": "uuid", "required": true },
    { "field": "client_id", "type": "uuid", "required": true },
    { "field": "owner_company", "type": "string" },
    { "field": "document_type", "type": "string" },
    { "field": "document_version", "type": "string" },
    { "field": "acceptance_method", "type": "string" },
    { "field": "acceptance_timestamp", "type": "timestamp" },
    { "field": "ip_address", "type": "string" },
    { "field": "user_agent", "type": "string" },
    { "field": "is_valid", "type": "boolean", "default": true },
    { "field": "proof_hash", "type": "string" }
  ]
}
```

### Collection: signature_requests
```json
{
  "collection": "signature_requests",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "document_id", "type": "string" },
    { "field": "document_type", "type": "string" },
    { "field": "owner_company", "type": "string" },
    { "field": "required_level", "type": "string" },
    { "field": "status", "type": "string", "default": "pending" },
    { "field": "signers", "type": "json" },
    { "field": "document_hash", "type": "string" },
    { "field": "provider", "type": "string" },
    { "field": "provider_request_id", "type": "string" },
    { "field": "signing_url", "type": "string" },
    { "field": "callback_url", "type": "string" },
    { "field": "deadline", "type": "timestamp" },
    { "field": "message", "type": "text" },
    { "field": "created_at", "type": "timestamp" },
    { "field": "completed_at", "type": "timestamp" },
    { "field": "cancelled_at", "type": "timestamp" }
  ]
}
```

### Collection: signature_events
```json
{
  "collection": "signature_events",
  "fields": [
    { "field": "id", "type": "uuid", "primary": true },
    { "field": "signature_request_id", "type": "uuid" },
    { "field": "signer_email", "type": "string" },
    { "field": "status", "type": "string" },
    { "field": "signature_data", "type": "json" },
    { "field": "timestamp", "type": "timestamp" },
    { "field": "provider", "type": "string" }
  ]
}
```

## Variables d'environnement requises

```bash
# Prestataire signature par défaut
DEFAULT_SIGNATURE_PROVIDER=SWISSCOM

# Swisscom Sign
SWISSCOM_SIGN_API_URL=https://api.swisscom.com/sign
SWISSCOM_SIGN_API_KEY=your_api_key

# SwissSign (alternative)
SWISSSIGN_API_URL=https://api.swisssign.com
SWISSSIGN_API_KEY=your_api_key

# DigiCert/QuoVadis (alternative)
DIGICERT_API_URL=https://api.digicert.com
DIGICERT_API_KEY=your_api_key

# Secret pour hash de preuve CGV
CGV_PROOF_SECRET=your_secret_key

# URLs
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

## Instructions pour Claude Code

1. Créer le dossier `src/backend/services/legal/`
2. Créer `cgv.service.js` avec le code complet
3. Créer `signature.service.js` avec le code complet
4. Créer le dossier `src/backend/api/legal/`
5. Créer `legal.routes.js` avec les routes
6. Créer `index.js` pour exporter les routes
7. Mettre à jour `server.js` pour inclure les routes légales
8. Créer les 4 collections Directus (cgv_documents, cgv_acceptances, signature_requests, signature_events)
9. Ajouter les variables d'environnement au `.env.example`

## Rapport à créer: RAPPORT-09-CGV-SIGNATURE-ELECTRONIQUE.md
