const express = require('express');
const { getRedisClient } = require('../config/redis');
const OCRService = require('../services/ocr.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const redis = getRedisClient();
    
    // Test Redis
    const redisStatus = redis ? 'connected' : 'disconnected';
    
    // Test OCR Service
    const ocrStatus = OCRService.getStatus ? OCRService.getStatus() : { initialized: false };
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        redis: redisStatus,
        ocr: ocrStatus
      }
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;