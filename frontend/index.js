/**
 * Router principal - Redirige vers les portails selon le rôle
 * Conserve 100% de la logique existante du dashboard
 * NE PAS MODIFIER LA LOGIQUE MÉTIER
 */

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use('/assets', express.static(path.join(__dirname, 'shared/assets')));
app.use('/tabler', express.static(path.join(__dirname, 'shared/tabler')));

// Middleware d'authentification Directus
async function authenticateDirectus(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.directus_token ||
                  req.query?.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        // Vérifier le token avec Directus
        const response = await axios.get('http://localhost:8055/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        req.user = response.data.data;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.redirect('/login');
    }
}

// Routes des portails (préserver la logique existante)
app.use('/superadmin', authenticateDirectus, express.static(path.join(__dirname, 'portals/superadmin')));
app.use('/client', authenticateDirectus, express.static(path.join(__dirname, 'portals/client')));
app.use('/prestataire', authenticateDirectus, express.static(path.join(__dirname, 'portals/prestataire')));
app.use('/revendeur', authenticateDirectus, express.static(path.join(__dirname, 'portals/revendeur')));

// Page de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'portals/login.html'));
});

// Redirection selon le rôle (logique existante préservée)
app.get('/', authenticateDirectus, (req, res) => {
    const role = req.user?.role?.name || req.user?.role;
    
    switch(role) {
        case 'Administrator':
        case 'superadmin':
            res.redirect('/superadmin');
            break;
        case 'Client':
        case 'client':
            res.redirect('/client');
            break;
        case 'Prestataire':
        case 'prestataire':
            res.redirect('/prestataire');
            break;
        case 'Revendeur':
        case 'revendeur':
            res.redirect('/revendeur');
            break;
        default:
            res.redirect('/login');
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Dashboard démarré sur http://localhost:${PORT}`);
    console.log('📁 Portails disponibles:');
    console.log('   - /superadmin (avec OCR)');
    console.log('   - /client');
    console.log('   - /prestataire');
    console.log('   - /revendeur');
});