// Middleware d'authentification spécifique pour l'OCR
const ocrAuthMiddleware = (req, res, next) => {
  try {
    // Vérifier la clé API OCR
    const apiKey = req.headers['x-ocr-api-key'];
    
    if (!apiKey || apiKey !== process.env.OCR_API_KEY) {
      console.log('❌ OCR Auth failed - Invalid API key');
      return res.status(403).json({ 
        error: 'Accès non autorisé',
        message: 'Clé API OCR invalide ou manquante'
      });
    }
    
    // Vérifier l'origine (sécurité supplémentaire)
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.log('❌ OCR Auth failed - Invalid origin:', origin);
      return res.status(403).json({ 
        error: 'Origine non autorisée' 
      });
    }
    
    // Ajouter un pseudo-utilisateur OCR
    req.user = {
      id: 'ocr-system',
      email: 'ocr@system.local',
      roles: ['ocr'],
      name: 'OCR System'
    };
    
    console.log('✅ OCR Auth successful');
    next();
  } catch (error) {
    console.error('OCR auth error:', error);
    res.status(500).json({ error: 'Erreur d\'authentification OCR' });
  }
};

module.exports = ocrAuthMiddleware;