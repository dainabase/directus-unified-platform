// server.js - Serveur API sécurisé pour le Dashboard Multi-Rôles
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const notionRoutes = require('./routes/notion');
const { router: authRouter, authenticateToken } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware de sécurité avancé avec CSP corrigée pour OCR
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.jsdelivr.net",
        "https://rsms.me",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: [
        "'self'", 
        "http://localhost:*",
        "https://api.pwnedpasswords.com",
        "https://api.openai.com",
        "https://api.notion.com"
      ],
      fontSrc: [
        "'self'", 
        "https://cdn.jsdelivr.net",
        "https://rsms.me",
        "https://fonts.gstatic.com",
        "data:"
      ],
      workerSrc: ["'self'", "blob:", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "data:", "blob:"],
      frameSrc: ["'self'"]
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
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Servir les fichiers statiques
app.use(express.static('./', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

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

// Routes publiques
app.use('/api/auth', authRouter);

// Routes Notion (avec health check public et routes protégées)
app.use('/api/notion', notionRoutes);
// TODO: Corriger ces routes après
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
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route protégée de test
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user
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

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`
🚀 Serveur API sécurisé démarré
📍 Port: ${PORT}
🔒 Environnement: ${process.env.NODE_ENV || 'development'}
🔐 Sécurité: Helmet + CORS + Rate Limiting + JWT
🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:8000'}
⏰ Démarré le: ${new Date().toLocaleString('fr-CH')}
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