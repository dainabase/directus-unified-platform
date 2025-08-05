// middleware/auth.js - Middleware d'authentification JWT
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier les permissions
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const permissionKey = `${resource}.${action}`;
      
      // TODO: Implémenter la vérification réelle des permissions
      // Pour l'instant, on vérifie juste le rôle basique
      const userRoles = req.user.roles || [];
      
      // Logique simplifiée de permissions
      const hasPermission = userRoles.some(role => {
        // Admin a tous les droits
        if (role === 'admin') return true;
        
        // Vérifications spécifiques par rôle
        if (resource.startsWith('client.') && role === 'client') return true;
        if (resource.startsWith('prestataire.') && role === 'prestataire') return true;
        if (resource.startsWith('revendeur.') && role === 'revendeur') return true;
        
        return false;
      });
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Permissions insuffisantes',
          required: permissionKey 
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Erreur de vérification des permissions' });
    }
  };
};

module.exports = {
  authMiddleware,
  checkPermission
};