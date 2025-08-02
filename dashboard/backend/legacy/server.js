// server.js - Serveur API sécurisé pour le Dashboard Multi-Rôles
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const notionRoutes = require('./routes/notion');
const ocrRoutes = require('./routes/ocr-notion');
const uploadProxyRoutes = require('./routes/upload-proxy');
const { router: authRouter, authenticateToken } = require('./routes/auth');

const app = express();
const net = require('net');
const path = require('path');

// FORCE PORT 3000 POUR OCR
const PORT = 3000;
console.log('🔒 PORT FORCÉ À 3000 POUR LE MODULE OCR');

// Plus de détection automatique - PORT FORCÉ À 3000

// Middleware de sécurité avancé
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://api.pwnedpasswords.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging détaillé
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par minute
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' // Skip pour localhost
});

// Rate limiting strict pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par 15 minutes
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne compte que les échecs
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Servir les fichiers statiques AVANT les routes API
// Servir les fichiers statiques depuis la racine
app.use(express.static(path.join(__dirname, '..')));

// Route catch-all pour l'OCR et documents
app.get('/superadmin/finance/*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  res.sendFile(filePath);
});

app.get('/superadmin/documents/*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  res.sendFile(filePath);
});

// Routes OCR avec authentification spéciale (AVANT les routes JWT)
app.use('/api/ocr', ocrRoutes);

// Routes upload-proxy sans authentification (pour l'OCR)
app.use('/api/notion/upload-proxy', uploadProxyRoutes);

// Routes avec auth JWT
app.use('/api/auth', authRouter);
app.use('/api/notion', authenticateToken, notionRoutes);
// app.use('/api/finance', authenticateToken, require('./routes/api/finance'));
// app.use('/api/projects', authenticateToken, require('./routes/api/projects'));
// app.use('/api/crm', authenticateToken, require('./routes/api/crm'));

// Health check publique
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    port: PORT
  });
});

// Endpoint de statut de configuration pour l'OCR
app.get('/api/config/status', (req, res) => {
  const notionKeyConfigured = !!process.env.NOTION_API_KEY;
  const notionKeyValid = process.env.NOTION_API_KEY && 
    process.env.NOTION_API_KEY.length > 20 && 
    process.env.NOTION_API_KEY.startsWith('ntn_');
  
  res.json({
    server: {
      status: 'running',
      port: PORT,
      defaultPort: DEFAULT_PORT,
      portAutoDetected: PORT !== DEFAULT_PORT,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
      credentials: true
    },
    notion: {
      apiKeyConfigured: notionKeyConfigured,
      apiKeyValid: notionKeyValid,
      apiVersion: process.env.NOTION_API_VERSION || '2022-06-28',
      message: !notionKeyConfigured ? 'Clé API Notion non configurée' : 
               !notionKeyValid ? 'Format de clé API invalide' : 
               'Configuration Notion OK'
    },
    ocr: {
      ready: notionKeyConfigured,
      urls: {
        interface: `http://localhost:${PORT}/superadmin/documents/vision-ai.html`,
        api: `http://localhost:${PORT}/api/notion`,
        health: `http://localhost:${PORT}/health`,
        status: `http://localhost:${PORT}/api/config/status`
      },
      message: notionKeyConfigured ? 
        `✅ OCR prêt sur http://localhost:${PORT}` : 
        '⚠️ Configurez NOTION_API_KEY dans .env'
    },
    timestamp: new Date().toISOString()
  });
});

// Route protégée de test
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user
  });
});

// Route de vérification OCR
app.get('/api/ocr/status', (req, res) => {
  res.json({
    status: 'ready',
    port: PORT,
    message: '✅ Serveur OCR prêt sur port 3000',
    endpoints: {
      health: 'http://localhost:3000/health',
      ocr: 'http://localhost:3000/superadmin/documents/vision-ai.html',
      api: 'http://localhost:3000/api/notion/*'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  // Log détaillé de l'erreur
  console.error('Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'Accès refusé par la politique CORS',
      allowedOrigins: process.env.ALLOWED_ORIGINS
    });
  }
  
  // Ne pas révéler les détails en production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Erreur serveur interne',
    ...(isDev && { 
      stack: err.stack,
      details: err 
    })
  });
});

// Démarrage du serveur SUR PORT 3000 UNIQUEMENT
const server = app.listen(PORT, () => {
  console.log(`
🚀 Serveur API sécurisé démarré
📍 Port: ${PORT} (FORCÉ)
🔒 Environnement: ${process.env.NODE_ENV || 'development'}
🔐 Sécurité: Helmet + CORS + Rate Limiting + JWT
🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:8000'}
⏰ Démarré le: ${new Date().toLocaleString('fr-CH')}

🌐 Interface OCR: http://localhost:${PORT}/superadmin/documents/vision-ai.html
🔍 Statut OCR: http://localhost:${PORT}/api/ocr/status
🔍 Statut config: http://localhost:${PORT}/api/config/status
📁 Fichiers statiques servis depuis: ${path.join(__dirname, '..')}
`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n⏹️  Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Arrêt du serveur (SIGTERM)...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  // En dev, on crash pour détecter les problèmes
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

module.exports = app; // Pour les tests