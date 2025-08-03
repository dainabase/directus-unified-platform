// Routes upload proxy pour l'OCR avec Cloudinary
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du storage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dashboard-documents',
        format: async (req, file) => 'pdf',
        public_id: (req, file) => {
            const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${uniqueId}-${file.originalname.replace(/\.[^/.]+$/, "")}`;
        }
    }
});

// Configuration multer avec Cloudinary
const upload = multer({ storage: storage });

// Stocker temporairement les infos d'upload
const uploadSessions = new Map();

// POST /api/notion/upload-proxy/create - Créer session upload
router.post('/create', async (req, res) => {
  console.log('🔍 Upload Proxy: Création session upload');
  
  try {
    const { filename, content_type } = req.body;
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Stocker la session
    uploadSessions.set(uploadId, {
      id: uploadId,
      filename: filename,
      content_type: content_type,
      created_at: new Date(),
      status: 'created'
    });
    
    console.log('✅ Session créée:', uploadId);
    res.json({
      id: uploadId,
      filename: filename,
      content_type: content_type
    });
    
  } catch (error) {
    console.error('❌ Erreur création upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notion/upload-proxy/send/:id - Uploader fichier vers Cloudinary
router.post('/send/:id', upload.single('file'), async (req, res) => {
  console.log('🔍 Upload Proxy: Upload fichier vers Cloudinary ID:', req.params.id);
  
  try {
    const uploadId = req.params.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    // Le fichier est déjà uploadé sur Cloudinary par multer
    console.log('✅ Fichier uploadé sur Cloudinary:', file.path);
    
    // Mettre à jour la session avec les infos Cloudinary
    const session = uploadSessions.get(uploadId);
    if (session) {
      session.status = 'uploaded';
      session.uploaded_at = new Date();
      session.cloudinary_url = file.path;
      session.cloudinary_id = file.public_id;
      session.secure_url = file.secure_url;
    }
    
    res.json({
      success: true,
      upload_id: uploadId,
      message: 'Fichier uploadé sur Cloudinary',
      url: file.secure_url
    });
    
  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notion/upload-proxy/info/:id - Info fichier avec URL Cloudinary
router.get('/info/:id', async (req, res) => {
  console.log('🔍 Upload Proxy: Info fichier ID:', req.params.id);
  
  try {
    const session = uploadSessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }
    
    console.log('✅ Info récupérée:', req.params.id);
    res.json({
      id: req.params.id,
      filename: session.filename,
      file_url: session.secure_url || session.cloudinary_url || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/dashboard-documents/${req.params.id}/${session.filename}`,
      status: session.status,
      uploaded_at: session.uploaded_at,
      cloudinary_id: session.cloudinary_id
    });
    
  } catch (error) {
    console.error('❌ Erreur info fichier:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;