const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Import des sous-routes
const uploadProxyRouter = require('./api/notion/upload-proxy');

// Route principale pour les uploads
router.use('/upload-proxy', uploadProxyRouter);

// Proxy routes pour éviter CORS avec l'API Notion
// Configuration du proxy middleware
const proxyToNotion = async (req, res, next) => {
    try {
        // Construire l'URL de destination
        const notionUrl = `https://api.notion.com/v1${req.path}`;
        
        // Préparer les headers
        const headers = {
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/json',
            'Notion-Version': req.headers['notion-version'] || '2022-06-28'
        };
        
        // Préparer les options de la requête
        const options = {
            method: req.method,
            headers: headers
        };
        
        // Ajouter le body pour POST/PATCH/PUT
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            options.body = JSON.stringify(req.body);
        }
        
        console.log(`🔄 Proxy Notion: ${req.method} ${notionUrl}`);
        
        // Faire l'appel à l'API Notion
        const response = await fetch(notionUrl, options);
        const data = await response.json();
        
        // Retourner la réponse avec le même status code
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('❌ Erreur proxy Notion:', error);
        res.status(500).json({ 
            error: 'Erreur proxy Notion', 
            message: error.message 
        });
    }
};

// Routes proxy pour l'API Notion
router.get('/pages*', proxyToNotion);
router.post('/pages*', proxyToNotion);
router.patch('/pages*', proxyToNotion);
router.get('/databases*', proxyToNotion);
router.post('/databases*', proxyToNotion);
router.get('/blocks*', proxyToNotion);
router.post('/blocks*', proxyToNotion);
router.patch('/blocks*', proxyToNotion);

// Health check spécifique pour les routes Notion (public)
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'notion-api',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/upload-proxy/create',
            '/upload-proxy/send/:id', 
            '/upload-proxy/info/:id',
            '/pages (GET/POST/PATCH)',
            '/databases (GET/POST)',
            '/blocks (GET/POST/PATCH)'
        ],
        authentication: 'required for all endpoints',
        cors_fix: 'Proxy configuré pour éviter les erreurs CORS'
    });
});

module.exports = router;