const express = require('express');
const { register, Counter, Histogram, Gauge } = require('prom-client');

// Métriques personnalisées
const ocrProcessedTotal = new Counter({
  name: 'ocr_documents_processed_total',
  help: 'Total des documents traités',
  labelNames: ['status', 'document_type']
});

const ocrProcessingDuration = new Histogram({
  name: 'ocr_processing_duration_seconds',
  help: 'Durée de traitement OCR en secondes',
  labelNames: ['document_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const ocrConfidenceScore = new Histogram({
  name: 'ocr_confidence_score',
  help: 'Score de confiance OCR',
  labelNames: ['document_type'],
  buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
});

const ocrQueueSize = new Gauge({
  name: 'ocr_queue_size',
  help: 'Nombre de documents en attente'
});

const ocrActiveWorkers = new Gauge({
  name: 'ocr_active_workers',
  help: 'Nombre de workers actifs'
});

const ocrCacheHits = new Counter({
  name: 'ocr_cache_hits_total',
  help: 'Nombre de hits cache'
});

const ocrCacheMisses = new Counter({
  name: 'ocr_cache_misses_total',
  help: 'Nombre de miss cache'
});

// Router pour exposer les métriques
const metricsRouter = express.Router();

metricsRouter.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Fonctions helper pour enregistrer les métriques
function recordProcessing(documentType, duration, confidence, success) {
  ocrProcessedTotal.inc({ 
    status: success ? 'success' : 'error', 
    document_type: documentType 
  });
  
  if (success) {
    ocrProcessingDuration.observe({ document_type: documentType }, duration / 1000);
    ocrConfidenceScore.observe({ document_type: documentType }, confidence);
  }
}

function recordCacheHit() {
  ocrCacheHits.inc();
}

function recordCacheMiss() {
  ocrCacheMisses.inc();
}

function updateQueueSize(size) {
  ocrQueueSize.set(size);
}

function updateActiveWorkers(count) {
  ocrActiveWorkers.set(count);
}

module.exports = {
  metricsRouter,
  recordProcessing,
  recordCacheHit,
  recordCacheMiss,
  updateQueueSize,
  updateActiveWorkers
};