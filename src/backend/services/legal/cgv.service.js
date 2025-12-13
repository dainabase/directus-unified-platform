/**
 * Service CGV/CGL - Conforme Droit Suisse
 * 
 * Gère les Conditions Générales de Vente et de Location
 * selon les articles du Code des Obligations et LCD
 */

import { createDirectus, rest, authentication, readItems, createItem, updateItem } from '@directus/sdk';

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
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
  }

  getDirectusClient() {
    const client = createDirectus(this.directusUrl)
      .with(authentication())
      .with(rest());
    if (this.directusToken) {
      client.setToken(this.directusToken);
    }
    return client;
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
    const directus = this.getDirectusClient();
    const cgvDocument = await directus.request(
      createItem('cgv_documents', {
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
      })
    );

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
    const directus = this.getDirectusClient();
    
    const activeDocuments = await directus.request(
      readItems('cgv_documents', {
        filter: {
          owner_company: { _eq: ownerCompany },
          document_type: { _eq: documentType },
          status: { _eq: 'active' }
        }
      })
    );

    for (const doc of activeDocuments || []) {
      await directus.request(
        updateItem('cgv_documents', doc.id, {
          status: 'archived',
          archived_at: new Date().toISOString()
        })
      );
    }
  }

  /**
   * Obtenir le CGV actif pour une entreprise
   */
  async getActiveCGV(ownerCompany, documentType, language = 'fr') {
    const directus = this.getDirectusClient();
    
    const result = await directus.request(
      readItems('cgv_documents', {
        filter: {
          owner_company: { _eq: ownerCompany },
          document_type: { _eq: documentType },
          status: { _eq: 'active' },
          language: { _eq: language }
        },
        sort: ['-effective_date'],
        limit: 1
      })
    );

    return result?.[0] || null;
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

    const directus = this.getDirectusClient();

    // Récupérer le document CGV
    const cgvDocument = await directus.request(
      readItems('cgv_documents', {
        filter: { id: { _eq: cgv_document_id } },
        limit: 1
      })
    );
    
    const cgvDoc = cgvDocument?.[0];
    if (!cgvDoc) {
      throw new Error('Document CGV non trouvé');
    }

    // Vérifier que le client existe
    const client = await directus.request(
      readItems('people', {
        filter: { id: { _eq: client_id } },
        limit: 1
      })
    );
    
    if (!client?.[0]) {
      throw new Error('Client non trouvé');
    }

    // Créer l'enregistrement d'acceptation
    const acceptance = await directus.request(
      createItem('cgv_acceptances', {
        cgv_document_id,
        client_id,
        owner_company: cgvDoc.owner_company,
        document_type: cgvDoc.document_type,
        document_version: cgvDoc.version,
        acceptance_method,
        acceptance_timestamp: timestamp || new Date().toISOString(),
        ip_address,
        user_agent,
        is_valid: true,
        // Données pour preuve légale
        proof_hash: this.generateProofHash({
          cgv_document_id,
          client_id,
          timestamp: timestamp || new Date().toISOString(),
          ip_address
        })
      })
    );

    // Log pour audit
    await this.logCGVEvent('cgv_accepted', cgv_document_id, cgvDoc.owner_company, {
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
    const content = JSON.stringify(data) + (process.env.CGV_PROOF_SECRET || 'default_secret');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Vérifier si un client a accepté les CGV actuels
   */
  async hasClientAcceptedCGV(clientId, ownerCompany, documentType) {
    const activeCGV = await this.getActiveCGV(ownerCompany, documentType);
    if (!activeCGV) return false;

    const directus = this.getDirectusClient();
    const acceptance = await directus.request(
      readItems('cgv_acceptances', {
        filter: {
          client_id: { _eq: clientId },
          cgv_document_id: { _eq: activeCGV.id },
          is_valid: { _eq: true }
        },
        limit: 1
      })
    );

    return (acceptance?.length || 0) > 0;
  }

  /**
   * Générer le contenu CGV avec les données de l'entreprise
   */
  async generateCGVContent(ownerCompany, documentType, customData = {}) {
    const directus = this.getDirectusClient();
    
    // Récupérer les informations de l'entreprise
    const company = await directus.request(
      readItems('companies', {
        filter: { name: { _eq: ownerCompany } },
        limit: 1
      })
    );

    const companyData = company?.[0];
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
      version: customData.version || '1.0',
      effective_date: customData.effective_date || new Date().toLocaleDateString('fr-CH'),
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
    return `# CONDITIONS GÉNÉRALES DE VENTE

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

**Version: {{version}} - Date d'effet: {{effective_date}}**`;
  }

  /**
   * Template CGL de Location
   */
  getLocationCGLTemplate() {
    return `# CONDITIONS GÉNÉRALES DE LOCATION

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

**Version: {{version}} - Date d'effet: {{effective_date}}**`;
  }

  /**
   * Template CGV de Service
   */
  getServiceCGVTemplate() {
    return `# CONDITIONS GÉNÉRALES DE SERVICE

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

**Version: {{version}} - Date d'effet: {{effective_date}}**`;
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
    try {
      const directus = this.getDirectusClient();
      await directus.request(
        createItem('audit_logs', {
          event_type: eventType,
          entity_type: 'cgv_document',
          entity_id: documentId,
          owner_company: ownerCompany,
          metadata: JSON.stringify(metadata),
          timestamp: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Erreur logging CGV event:', error);
    }
  }

  /**
   * Obtenir l'historique des versions CGV
   */
  async getCGVHistory(ownerCompany, documentType) {
    const directus = this.getDirectusClient();
    
    const result = await directus.request(
      readItems('cgv_documents', {
        filter: {
          owner_company: { _eq: ownerCompany },
          document_type: { _eq: documentType }
        },
        sort: ['-effective_date'],
        fields: ['id', 'version', 'effective_date', 'status', 'created_at', 'archived_at']
      })
    );

    return result || [];
  }
}

export const cgvService = new CGVService();
export default cgvService;