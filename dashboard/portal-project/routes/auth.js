const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Route de login simplifiée pour les tests
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validation simplifiée pour les tests
    if (username === 'admin' && password === 'admin123') {
        const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const token = jwt.sign(
            { id: 'admin', username: 'admin', role: 'superadmin' },
            jwtSecret,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: { id: 'admin', username: 'admin', role: 'superadmin' }
        });
    } else {
        res.status(401).json({ error: 'Identifiants invalides' });
    }
});

// Route de test pour vérifier l'authentification
router.get('/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

module.exports = { router, authenticateToken };