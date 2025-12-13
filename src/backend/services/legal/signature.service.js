/**
 * Service Signature Électronique - Conforme SCSE/ZertES
 * 
 * Intégration avec les prestataires QES reconnus en Suisse:
 * - Swisscom AG
 * - SwissSign AG
 * - QuoVadis Trustlink (DigiCert)
 */

import { createDirectus, rest, authentication, readItems, createItem, updateItem } from '@directus/sdk';
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
    this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.directusToken = process.env.DIRECTUS_TOKEN;
    this.defaultProvider = process.env.DEFAULT_SIGNATURE_PROVIDER || 'SWISSCOM';
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

    const directus = this.getDirectusClient();

    // Créer l'enregistrement de demande
    const signatureRequest = await directus.request(
      createItem('signature_requests', {
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
      })
    );

    // Initier la demande auprès du prestataire
    const providerResponse = await this.initiateWithProvider(
      signatureRequest.id,
      document_content,
      signers,
      requiredLevel
    );

    // Mettre à jour avec les infos du prestataire
    await directus.request(
      updateItem('signature_requests', signatureRequest.id, {
        provider_request_id: providerResponse.request_id,
        signing_url: providerResponse.signing_url,
        status: 'initiated'
      })
    );

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
    const directus = this.getDirectusClient();
    
    // Utiliser la queue email pour les notifications
    for (const signer of signers) {
      try {
        await directus.request(
          createItem('email_queue', {
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
          })
        );
      } catch (error) {
        console.error('Erreur notification signataire:', error);
      }
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

    const directus = this.getDirectusClient();

    // Trouver la demande
    const request = await directus.request(
      readItems('signature_requests', {
        filter: { provider_request_id: { _eq: provider_request_id } },
        limit: 1
      })
    );

    if (!request?.[0]) {
      throw new Error('Demande de signature non trouvée');
    }

    const signatureRequest = request[0];

    // Enregistrer la signature individuelle
    await directus.request(
      createItem('signature_events', {
        signature_request_id: signatureRequest.id,
        signer_email,
        status,
        signature_data: signature_data ? JSON.stringify(signature_data) : null,
        timestamp: timestamp || new Date().toISOString(),
        provider: signatureRequest.provider
      })
    );

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
    await directus.request(
      updateItem('signature_requests', signatureRequest.id, {
        signers: JSON.stringify(updatedSigners),
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
    );

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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const directus = this.getDirectusClient();
      
      // Sauvegarder dans Directus
      await directus.request(
        createItem('signed_documents', {
          signature_request_id: requestId,
          document: buffer.toString('base64'),
          filename: `signed_document_${requestId}.pdf`,
          created_at: new Date().toISOString()
        })
      );
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
    const directus = this.getDirectusClient();
    
    const request = await directus.request(
      readItems('signature_requests', {
        filter: { id: { _eq: signatureRequestId } },
        limit: 1
      })
    );
    
    const signatureRequest = request?.[0];
    if (!signatureRequest) {
      throw new Error('Demande de signature non trouvée');
    }

    const events = await directus.request(
      readItems('signature_events', {
        filter: { signature_request_id: { _eq: signatureRequestId } }
      })
    );

    return {
      is_valid: signatureRequest.status === 'completed',
      signature_level: signatureRequest.required_level,
      signers: JSON.parse(signatureRequest.signers),
      events: events || [],
      document_hash: signatureRequest.document_hash,
      completed_at: signatureRequest.completed_at
    };
  }

  /**
   * Obtenir les demandes de signature pour une entreprise
   */
  async getSignatureRequests(ownerCompany, filters = {}) {
    const directus = this.getDirectusClient();
    
    const query = {
      filter: {
        owner_company: { _eq: ownerCompany },
        ...filters
      },
      sort: ['-created_at'],
      limit: filters.limit || 50
    };

    const result = await directus.request(
      readItems('signature_requests', query)
    );
    
    return result || [];
  }

  /**
   * Annuler une demande de signature
   */
  async cancelSignatureRequest(requestId) {
    const directus = this.getDirectusClient();
    
    const request = await directus.request(
      readItems('signature_requests', {
        filter: { id: { _eq: requestId } },
        limit: 1
      })
    );
    
    const signatureRequest = request?.[0];
    if (!signatureRequest) {
      throw new Error('Demande non trouvée');
    }

    if (signatureRequest.status === 'completed') {
      throw new Error('Impossible d\'annuler une demande complétée');
    }

    // Annuler auprès du prestataire si applicable
    if (signatureRequest.provider_request_id) {
      await this.cancelWithProvider(signatureRequest.provider_request_id);
    }

    await directus.request(
      updateItem('signature_requests', requestId, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
    );

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