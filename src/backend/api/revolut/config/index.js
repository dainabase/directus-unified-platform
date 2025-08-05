/**
 * Configuration pour l'intégration Revolut Business API
 * Support des 5 entreprises avec environnements sandbox/production
 */

module.exports = {
  revolut: {
    // URLs API selon l'environnement
    baseURL: process.env.REVOLUT_ENV === 'production' 
      ? 'https://b2b.revolut.com/api/1.0'
      : 'https://sandbox-b2b.revolut.com/api/1.0',
    
    authURL: process.env.REVOLUT_ENV === 'production'
      ? 'https://b2b.revolut.com/api/1.0/auth/token'
      : 'https://sandbox-b2b.revolut.com/api/1.0/auth/token',
    
    // Configuration par entreprise
    companies: {
      hypervisual: {
        clientId: process.env.REVOLUT_HYPERVISUAL_CLIENT_ID,
        privateKeyPath: process.env.REVOLUT_HYPERVISUAL_PRIVATE_KEY_PATH || './certs/hypervisual-private.pem'
      },
      dynamics: {
        clientId: process.env.REVOLUT_DYNAMICS_CLIENT_ID,
        privateKeyPath: process.env.REVOLUT_DYNAMICS_PRIVATE_KEY_PATH || './certs/dynamics-private.pem'
      },
      lexia: {
        clientId: process.env.REVOLUT_LEXIA_CLIENT_ID,
        privateKeyPath: process.env.REVOLUT_LEXIA_PRIVATE_KEY_PATH || './certs/lexia-private.pem'
      },
      nkreality: {
        clientId: process.env.REVOLUT_NKREALITY_CLIENT_ID,
        privateKeyPath: process.env.REVOLUT_NKREALITY_PRIVATE_KEY_PATH || './certs/nkreality-private.pem'
      },
      etekout: {
        clientId: process.env.REVOLUT_ETEKOUT_CLIENT_ID,
        privateKeyPath: process.env.REVOLUT_ETEKOUT_PRIVATE_KEY_PATH || './certs/etekout-private.pem'
      }
    },

    // Options globales
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    
    // Webhooks
    webhookSecret: process.env.REVOLUT_WEBHOOK_SECRET,
    webhookUrl: process.env.REVOLUT_WEBHOOK_URL || 'https://your-domain.com/api/revolut/webhook'
  },
  
  // Configuration Directus
  directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
  directusToken: process.env.DIRECTUS_API_TOKEN || process.env.DIRECTUS_TOKEN,
  directusEmail: process.env.DIRECTUS_ADMIN_EMAIL,
  directusPassword: process.env.DIRECTUS_ADMIN_PASSWORD,

  // Configuration synchronisation
  sync: {
    // Intervalle de sync automatique (en minutes)
    intervalMinutes: parseInt(process.env.REVOLUT_SYNC_INTERVAL) || 60,
    
    // Nombre de jours d'historique à synchroniser
    historyDays: parseInt(process.env.REVOLUT_HISTORY_DAYS) || 30,
    
    // Batch size pour les transactions
    batchSize: parseInt(process.env.REVOLUT_BATCH_SIZE) || 100,
    
    // Activer la sync automatique
    autoSync: process.env.REVOLUT_AUTO_SYNC === 'true',
    
    // Entreprises à synchroniser (par défaut toutes)
    companies: process.env.REVOLUT_SYNC_COMPANIES?.split(',') || 
      ['hypervisual', 'dynamics', 'lexia', 'nkreality', 'etekout']
  },

  // Configuration logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableApiLogs: process.env.REVOLUT_API_LOGS === 'true',
    enableSyncLogs: process.env.REVOLUT_SYNC_LOGS === 'true'
  },

  // Sécurité
  security: {
    // Rate limiting (requêtes par minute)
    rateLimit: parseInt(process.env.REVOLUT_RATE_LIMIT) || 100,
    
    // IP autorisées pour les webhooks
    allowedWebhookIPs: process.env.REVOLUT_WEBHOOK_IPS?.split(',') || [],
    
    // Chiffrement des données sensibles
    encryptionKey: process.env.REVOLUT_ENCRYPTION_KEY
  },

  // Gestion d'erreurs
  errorHandling: {
    // Nombre de tentatives avant échec
    maxRetries: 3,
    
    // Délai entre les tentatives (ms)
    retryDelay: 2000,
    
    // Timeout par requête (ms)
    requestTimeout: 30000,
    
    // Alertes par email en cas d'erreur
    emailAlerts: process.env.REVOLUT_EMAIL_ALERTS === 'true',
    alertEmail: process.env.REVOLUT_ALERT_EMAIL
  },

  // Cache Redis (optionnel)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: 'revolut:'
  }
};

// Validation de la configuration
function validateConfig() {
  const errors = [];
  const config = module.exports;

  // Vérifier les variables essentielles
  if (!process.env.DIRECTUS_URL) {
    errors.push('DIRECTUS_URL requis');
  }

  if (!process.env.DIRECTUS_API_TOKEN && !process.env.DIRECTUS_TOKEN) {
    errors.push('DIRECTUS_API_TOKEN ou DIRECTUS_TOKEN requis');
  }

  // Vérifier au moins une configuration d'entreprise
  const hasCompanyConfig = Object.values(config.revolut.companies)
    .some(company => company.clientId);

  if (!hasCompanyConfig) {
    errors.push('Au moins une configuration d\'entreprise Revolut requise');
  }

  // Warnings pour les configurations manquantes
  const warnings = [];
  
  if (process.env.REVOLUT_ENV !== 'production' && process.env.REVOLUT_ENV !== 'sandbox') {
    warnings.push('REVOLUT_ENV non défini, utilisation du sandbox par défaut');
  }

  if (!process.env.REVOLUT_WEBHOOK_SECRET) {
    warnings.push('REVOLUT_WEBHOOK_SECRET non défini, webhooks non sécurisés');
  }

  // Afficher les erreurs et warnings
  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration Revolut:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Configuration Revolut invalide');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Avertissements configuration Revolut:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.log('✅ Configuration Revolut validée');
}

// Valider au chargement du module
try {
  validateConfig();
} catch (error) {
  console.error('Configuration Revolut invalide:', error.message);
  // Ne pas faire planter l'application, juste loguer
}