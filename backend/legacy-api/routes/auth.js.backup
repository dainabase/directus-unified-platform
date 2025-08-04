// routes/auth.js - Routes d'authentification sécurisées
const express = require('express');
const jwt = require('jsonwebtoken');
const { Client } = require('@notionhq/client');
const PasswordService = require('../services/password.service');

const router = express.Router();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Base de données des utilisateurs
const USERS_DB_ID = process.env.DB_UTILISATEURS || 'f5d6a111-e694-8014-b101-ce16fb21f644';

// Stockage temporaire des tentatives de connexion (à remplacer par Redis en production)
const loginAttempts = new Map();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Middleware pour vérifier le JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

/**
 * Vérifier les tentatives de connexion
 */
function checkLoginAttempts(email) {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  
  // Reset après 15 minutes
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  // Bloquer après 5 tentatives
  if (attempts.count >= 5) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000 / 60);
    return {
      blocked: true,
      message: `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`
    };
  }
  
  return { blocked: false };
}

/**
 * Enregistrer une tentative de connexion
 */
function recordLoginAttempt(email, success = false) {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    loginAttempts.delete(email);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(email, attempts);
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des entrées
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    // Vérifier les tentatives de connexion
    const attemptCheck = checkLoginAttempts(email);
    if (attemptCheck.blocked) {
      return res.status(429).json({ error: attemptCheck.message });
    }

    try {
      // Rechercher l'utilisateur dans Notion
      const response = await notion.databases.query({
        database_id: USERS_DB_ID,
        filter: {
          property: 'Email',
          email: { equals: email.toLowerCase() }
        }
      });

      if (response.results.length === 0) {
        recordLoginAttempt(email, false);
        // Ne pas révéler que l'utilisateur n'existe pas
        return res.status(401).json({ 
          error: 'Email ou mot de passe incorrect' 
        });
      }

      const user = response.results[0];
      const properties = user.properties;

      // Récupérer le hash du mot de passe
      const passwordHash = properties.PasswordHash?.rich_text?.[0]?.text?.content;
      
      if (!passwordHash) {
        // Utilisateur sans mot de passe hashé (ancienne version)
        recordLoginAttempt(email, false);
        return res.status(401).json({ 
          error: 'Compte nécessite une mise à jour de sécurité. Contactez l\'administrateur.' 
        });
      }

      // Vérifier le mot de passe
      const isValid = await PasswordService.verify(password, passwordHash);
      
      if (!isValid) {
        recordLoginAttempt(email, false);
        return res.status(401).json({ 
          error: 'Email ou mot de passe incorrect' 
        });
      }

      // Succès - réinitialiser les tentatives
      recordLoginAttempt(email, true);

      // Extraire les données utilisateur
      const userData = {
        id: user.id,
        email: properties.Email?.email,
        name: properties.Nom?.rich_text?.[0]?.text?.content || 'Utilisateur',
        role: properties.Role?.select?.name || 'client',
        requiresPasswordChange: properties.RequiresPasswordChange?.checkbox || false
      };

      // Générer le JWT
      const token = jwt.sign(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Mettre à jour la dernière connexion
      await notion.pages.update({
        page_id: user.id,
        properties: {
          'LastLogin': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      }).catch(err => {
        console.error('Erreur mise à jour dernière connexion:', err);
      });

      res.json({
        success: true,
        token,
        user: userData
      });

    } catch (notionError) {
      console.error('Erreur Notion:', notionError);
      // En cas d'erreur Notion, vérifier les utilisateurs locaux (dev uniquement)
      if (process.env.NODE_ENV === 'development') {
        try {
          const fs = require('fs');
          const localUsers = JSON.parse(fs.readFileSync('local-test-users.json', 'utf8'));
          const localUser = localUsers.find(u => u.email === email.toLowerCase());
          
          if (localUser) {
            const isValid = await PasswordService.verify(password, localUser.passwordHash);
            if (isValid) {
              recordLoginAttempt(email, true);
              
              const token = jwt.sign(
                {
                  id: localUser.id,
                  email: localUser.email,
                  role: localUser.role
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
              );

              return res.json({
                success: true,
                token,
                user: {
                  id: localUser.id,
                  email: localUser.email,
                  name: localUser.name,
                  role: localUser.role,
                  requiresPasswordChange: true
                }
              });
            }
          }
        } catch (e) {
          // Ignorer si pas de fichier local
        }
      }
      
      recordLoginAttempt(email, false);
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la connexion' 
    });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Mot de passe actuel et nouveau requis' 
      });
    }

    // Valider la force du nouveau mot de passe
    const validation = PasswordService.validateStrength(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Nouveau mot de passe invalide',
        details: validation.errors 
      });
    }

    // Vérifier si le mot de passe est compromis
    const isCompromised = await PasswordService.isCompromised(newPassword);
    if (isCompromised) {
      return res.status(400).json({ 
        error: 'Ce mot de passe a été compromis dans une fuite de données. Choisissez-en un autre.' 
      });
    }

    try {
      // Récupérer l'utilisateur
      const user = await notion.pages.retrieve({ page_id: userId });
      const passwordHash = user.properties.PasswordHash?.rich_text?.[0]?.text?.content;

      if (!passwordHash) {
        return res.status(400).json({ 
          error: 'Compte nécessite une mise à jour. Contactez l\'administrateur.' 
        });
      }

      // Vérifier le mot de passe actuel
      const isValid = await PasswordService.verify(currentPassword, passwordHash);
      if (!isValid) {
        return res.status(401).json({ 
          error: 'Mot de passe actuel incorrect' 
        });
      }

      // Hasher le nouveau mot de passe
      const newHash = await PasswordService.hash(newPassword);

      // Mettre à jour dans Notion
      await notion.pages.update({
        page_id: userId,
        properties: {
          'PasswordHash': {
            rich_text: [{
              type: 'text',
              text: { content: newHash }
            }]
          },
          'PasswordUpdatedAt': {
            date: {
              start: new Date().toISOString()
            }
          },
          'RequiresPasswordChange': {
            checkbox: false
          }
        }
      });

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });

    } catch (notionError) {
      console.error('Erreur Notion:', notionError);
      
      // En mode dev, mettre à jour le fichier local
      if (process.env.NODE_ENV === 'development') {
        try {
          const fs = require('fs');
          const localUsers = JSON.parse(fs.readFileSync('local-test-users.json', 'utf8'));
          const userIndex = localUsers.findIndex(u => u.id === userId);
          
          if (userIndex !== -1) {
            const isValid = await PasswordService.verify(currentPassword, localUsers[userIndex].passwordHash);
            if (isValid) {
              localUsers[userIndex].passwordHash = await PasswordService.hash(newPassword);
              fs.writeFileSync('local-test-users.json', JSON.stringify(localUsers, null, 2));
              
              return res.json({
                success: true,
                message: 'Mot de passe modifié avec succès (local)'
              });
            }
          }
        } catch (e) {
          // Ignorer
        }
      }
      
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour du mot de passe' 
      });
    }

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ 
      error: 'Erreur serveur' 
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email requis' 
      });
    }

    // Vérifier les tentatives (anti-spam)
    const attemptCheck = checkLoginAttempts(`forgot-${email}`);
    if (attemptCheck.blocked) {
      return res.status(429).json({ error: attemptCheck.message });
    }

    // Ne pas révéler si l'email existe ou non
    res.json({
      success: true,
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation.'
    });

    // En arrière-plan, vérifier et envoyer l'email
    // TODO: Implémenter l'envoi d'email avec token temporaire
    console.log(`Demande de réinitialisation pour: ${email}`);
    recordLoginAttempt(`forgot-${email}`, true);

  } catch (error) {
    console.error('Erreur forgot password:', error);
    res.status(500).json({ 
      error: 'Erreur serveur' 
    });
  }
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Récupérer les infos utilisateur mises à jour
    const user = await notion.pages.retrieve({ page_id: req.user.id });
    const properties = user.properties;

    res.json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: properties.Nom?.rich_text?.[0]?.text?.content || 'Utilisateur',
        role: req.user.role,
        requiresPasswordChange: properties.RequiresPasswordChange?.checkbox || false
      }
    });
  } catch (error) {
    // Si erreur Notion, renvoyer les infos du token
    res.json({
      valid: true,
      user: req.user
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // Ici on pourrait invalider le token côté serveur si on avait un système de blacklist
  // Pour l'instant, on compte sur l'expiration du JWT
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = {
  router,
  authenticateToken
};