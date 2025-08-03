const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');

// Configuration de multer pour gérer les uploads en mémoire
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

// Import du middleware d'authentification du serveur principal
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    // Validation simplifiée pour le développement
    if (token === 'demo-token') {
        req.user = { id: 'demo-user', username: 'demo' };
        return next();
    }
    
    // Validation JWT normale
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

/**
 * Étape 1: Créer File Upload dans Notion
 * POST /api/notion/upload-proxy/create
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { filename, content_type } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Le nom de fichier est requis' });
        }
        
        console.log('📤 Création d\'upload pour:', filename);
        
        const notionApiKey = process.env.NOTION_API_KEY || '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';
        
        const response = await fetch('https://api.notion.com/v1/file_uploads', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({ 
                filename, 
                content_type: content_type || 'application/pdf'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Erreur Notion API:', data);
            return res.status(response.status).json({ 
                error: 'Erreur Notion API', 
                details: data 
            });
        }
        
        console.log('✅ Upload créé avec ID:', data.id);
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erreur création upload:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Étape 2: Upload du fichier vers Notion
 * POST /api/notion/upload-proxy/send/:id
 */
router.post('/send/:id', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }
        
        console.log('📤 Upload fichier pour ID:', id);
        console.log('📁 Fichier:', req.file.originalname, `(${req.file.size} bytes)`);
        
        const notionApiKey = process.env.NOTION_API_KEY || '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';
        
        // Créer FormData pour l'upload
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        
        const response = await fetch(`https://api.notion.com/v1/file_uploads/${id}/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ Erreur upload vers Notion:', errorData);
            return res.status(response.status).json({ 
                error: 'Erreur upload vers Notion', 
                details: errorData 
            });
        }
        
        // L'API retourne souvent 204 No Content en cas de succès
        const data = response.status === 204 ? { success: true } : await response.json();
        
        console.log('✅ Fichier uploadé avec succès');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erreur upload fichier:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Étape 3: Récupérer les informations du fichier uploadé
 * GET /api/notion/upload-proxy/info/:id
 */
router.get('/info/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('📋 Récupération infos fichier:', id);
        
        const notionApiKey = process.env.NOTION_API_KEY || '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';
        
        const response = await fetch(`https://api.notion.com/v1/file_uploads/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Erreur récupération infos:', data);
            return res.status(response.status).json({ 
                error: 'Erreur récupération infos', 
                details: data 
            });
        }
        
        console.log('✅ Infos fichier récupérées');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Erreur récupération infos:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route de test pour vérifier la connexion
 * GET /api/notion/upload-proxy/health
 */
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'notion-upload-proxy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;