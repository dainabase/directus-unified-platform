/**
 * Commercial API - Main Router
 *
 * Combine tous les endpoints du workflow commercial
 *
 * Base path: /api/commercial
 *
 * @date 15 Décembre 2025
 */

import express from 'express';
import quotesRoutes from './quotes.routes.js';
import depositsRoutes from './deposits.routes.js';
import cgvRoutes from './cgv.routes.js';
import signaturesRoutes from './signatures.routes.js';
import portalRoutes from './portal.routes.js';
import pipelineRoutes from './pipeline.routes.js';

const router = express.Router();

/**
 * API Info
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Commercial Workflow API',
    version: '1.0.0',
    description: 'API complète pour le workflow commercial: Lead → Quote → CGV → Signature → Acompte → Projet',
    endpoints: {
      quotes: '/api/commercial/quotes',
      deposits: '/api/commercial/deposits',
      cgv: '/api/commercial/cgv',
      signatures: '/api/commercial/signatures',
      portal: '/api/commercial/portal',
      pipeline: '/api/commercial/pipeline'
    },
    documentation: '/api/commercial/docs'
  });
});

/**
 * Routes
 */
router.use('/quotes', quotesRoutes);
router.use('/deposits', depositsRoutes);
router.use('/cgv', cgvRoutes);
router.use('/signatures', signaturesRoutes);
router.use('/portal', portalRoutes);
router.use('/pipeline', pipelineRoutes);

/**
 * API Documentation (simple)
 */
router.get('/docs', (req, res) => {
  res.json({
    title: 'Commercial Workflow API Documentation',
    version: '1.0.0',
    base_url: '/api/commercial',
    endpoints: {
      quotes: {
        'GET /quotes': 'Liste des devis avec filtres',
        'GET /quotes/stats': 'Statistiques des devis',
        'GET /quotes/:id': 'Récupérer un devis',
        'GET /quotes/:id/workflow': 'Statut workflow du devis',
        'POST /quotes': 'Créer un devis',
        'POST /quotes/from-lead': 'Convertir lead en devis',
        'POST /quotes/:id/send': 'Envoyer devis au client',
        'PATCH /quotes/:id/status': 'Mettre à jour statut',
        'POST /quotes/:id/cgv-accept': 'Enregistrer acceptation CGV',
        'POST /quotes/:id/sign': 'Marquer devis signé'
      },
      deposits: {
        'GET /deposits/pending': 'Acomptes en attente',
        'GET /deposits/overdue': 'Acomptes en retard',
        'GET /deposits/stats': 'Statistiques acomptes',
        'GET /deposits/config/:owner_company_id': 'Config acompte',
        'POST /deposits/calculate/:quote_id': 'Calculer montant',
        'POST /deposits/invoice/:quote_id': 'Créer facture acompte',
        'POST /deposits/paid/:quote_id': 'Marquer acompte payé'
      },
      cgv: {
        'GET /cgv/:owner_company_id': 'CGV active',
        'GET /cgv/:owner_company_id/versions': 'Historique versions',
        'GET /cgv/:owner_company_id/stats': 'Stats CGV',
        'POST /cgv': 'Créer version CGV',
        'POST /cgv/:cgv_id/activate': 'Activer version',
        'POST /cgv/accept': 'Enregistrer acceptation',
        'GET /cgv/check/:contact_id/:owner_company_id': 'Vérifier acceptation',
        'GET /cgv/history/:contact_id': 'Historique acceptations'
      },
      signatures: {
        'POST /signatures/request/:quote_id': 'Créer demande DocuSeal',
        'POST /signatures/initiate/:quote_id': 'Initier processus signature',
        'POST /signatures/manual/:quote_id': 'Signature manuelle',
        'GET /signatures/logs/:quote_id': 'Logs signatures',
        'GET /signatures/verify/:signature_log_id': 'Vérifier signature',
        'POST /signatures/webhook/docuseal': 'Webhook DocuSeal',
        'GET /signatures/types': 'Types de signature'
      },
      portal: {
        'POST /portal/auth/login': 'Connexion portail',
        'POST /portal/auth/activate': 'Activer compte',
        'POST /portal/auth/forgot-password': 'Mot de passe oublié',
        'POST /portal/auth/reset-password': 'Réinitialiser MDP',
        'GET /portal/auth/verify': 'Vérifier token',
        'GET /portal/me': 'Profil utilisateur',
        'PATCH /portal/me/preferences': 'MAJ préférences',
        'POST /portal/accounts': 'Créer compte (admin)'
      },
      pipeline: {
        'GET /pipeline/stats': 'Stats pipeline',
        'GET /pipeline/dashboard': 'Dashboard complet',
        'GET /pipeline/funnel': 'Données funnel',
        'GET /pipeline/kpis': 'KPIs principaux',
        'GET /pipeline/activity': 'Activité récente'
      }
    },
    workflow: {
      description: 'Workflow commercial complet',
      steps: [
        '1. Lead créé dans CRM/Mautic',
        '2. Conversion lead → devis (POST /quotes/from-lead)',
        '3. Envoi devis au client (POST /quotes/:id/send)',
        '4. Client consulte via portail',
        '5. Client accepte CGV (POST /cgv/accept)',
        '6. Client signe devis (POST /signatures/manual/:quote_id)',
        '7. Facture acompte générée (POST /deposits/invoice/:quote_id)',
        '8. Paiement acompte reçu (POST /deposits/paid/:quote_id)',
        '9. Projet créé automatiquement'
      ]
    },
    authentication: {
      portal: 'Bearer token JWT via /portal/auth/login',
      admin: 'Via Directus token ou auth middleware'
    }
  });
});

export default router;
