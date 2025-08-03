const jwt = require('jsonwebtoken');
const { logger } = require('../config/logger');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Auth failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};