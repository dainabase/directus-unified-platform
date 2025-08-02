/**
 * OCR Notion Backend Server
 * Serveur Express avec intégration Notion API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');

// Import routes
const ocrRoutes = require('./routes/ocr.routes');
const notionRoutes = require('./routes/notion.routes');
const notionDocumentsRoutes = require('./routes/notion-documents.routes');
const healthRoutes = require('./routes/health.routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/notion', notionDocumentsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'OCR Notion Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            ocr: '/api/ocr',
            notion: '/api/notion'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    
    // Don't leak error details in production
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(isDev && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 OCR Notion Backend running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
});