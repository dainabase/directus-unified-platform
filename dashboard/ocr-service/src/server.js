require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { logger } = require('./config/logger');
const { initializeRedis } = require('./config/redis');
const ocrRoutes = require('./routes/ocr.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Sécurité
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
  credentials: true
}));
app.use(compression());

// Rate limiting
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Trop de requêtes'
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/ocr', ocrRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erreur:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
  });
});

// Démarrage
async function startServer() {
  try {
    await initializeRedis();
    logger.info('✅ Redis connecté');
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🔍 OCR Service démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur démarrage:', error);
    process.exit(1);
  }
}

startServer();