/**
 * OCR Metrics - Système de monitoring et analytics
 * @version 1.0.0
 */
const OCRMetrics = {
  STORAGE_KEY: 'ocr_metrics',
  MAX_ENTRIES: 500,
  
  /**
   * Enregistrer une métrique de traitement
   */
  trackProcessing(data) {
    const metric = {
      id: this.generateId(),
      mode: data.mode || 'unknown', // 'docker' | 'fallback' | 'cache'
      duration: data.duration || 0,
      success: data.success || false,
      fileSize: data.fileSize || 0,
      fileType: data.fileType || 'unknown',
      confidence: data.confidence || 0,
      extractedFields: data.extractedFields || {},
      error: data.error || null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: data.language || 'fra'
    };
    
    this.saveMetric(metric);
    this.updateRealTimeStats(metric);
    
    return metric.id;
  },
  
  /**
   * Sauvegarder une métrique
   */
  saveMetric(metric) {
    try {
      const metrics = this.getAllMetrics();
      metrics.push(metric);
      
      // Garder seulement les N dernières entrées
      const trimmed = metrics.slice(-this.MAX_ENTRIES);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
      
      // Déclencher un événement pour les listeners
      window.dispatchEvent(new CustomEvent('ocr-metric-added', { detail: metric }));
    } catch (e) {
      console.error('Erreur sauvegarde métrique:', e);
    }
  },
  
  /**
   * Récupérer toutes les métriques
   */
  getAllMetrics() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },
  
  /**
   * Obtenir les statistiques globales
   */
  getStats(timeRange = 'all') {
    const metrics = this.getMetricsByTimeRange(timeRange);
    
    if (metrics.length === 0) {
      return this.getEmptyStats();
    }
    
    const successful = metrics.filter(m => m.success);
    const dockerMetrics = metrics.filter(m => m.mode === 'docker');
    const fallbackMetrics = metrics.filter(m => m.mode === 'fallback');
    const cacheMetrics = metrics.filter(m => m.mode === 'cache');
    
    return {
      total: metrics.length,
      successful: successful.length,
      failed: metrics.length - successful.length,
      successRate: (successful.length / metrics.length) * 100,
      
      avgDuration: this.average(metrics.map(m => m.duration)),
      minDuration: Math.min(...metrics.map(m => m.duration)),
      maxDuration: Math.max(...metrics.map(m => m.duration)),
      
      avgConfidence: this.average(successful.map(m => m.confidence)),
      avgFileSize: this.average(metrics.map(m => m.fileSize)),
      
      byMode: {
        docker: {
          count: dockerMetrics.length,
          percentage: (dockerMetrics.length / metrics.length) * 100,
          avgDuration: this.average(dockerMetrics.map(m => m.duration)),
          successRate: dockerMetrics.filter(m => m.success).length / dockerMetrics.length * 100
        },
        fallback: {
          count: fallbackMetrics.length,
          percentage: (fallbackMetrics.length / metrics.length) * 100,
          avgDuration: this.average(fallbackMetrics.map(m => m.duration)),
          successRate: fallbackMetrics.filter(m => m.success).length / fallbackMetrics.length * 100
        },
        cache: {
          count: cacheMetrics.length,
          percentage: (cacheMetrics.length / metrics.length) * 100,
          avgDuration: this.average(cacheMetrics.map(m => m.duration))
        }
      },
      
      byFileType: this.groupByProperty(metrics, 'fileType'),
      
      errorTypes: this.analyzeErrors(metrics.filter(m => !m.success)),
      
      performanceTrend: this.calculatePerformanceTrend(metrics),
      
      fieldExtractionStats: this.analyzeFieldExtraction(successful)
    };
  },
  
  /**
   * Obtenir des métriques par période
   */
  getMetricsByTimeRange(range) {
    const metrics = this.getAllMetrics();
    const now = new Date();
    
    switch(range) {
      case 'hour':
        const hourAgo = new Date(now - 60 * 60 * 1000);
        return metrics.filter(m => new Date(m.timestamp) > hourAgo);
        
      case 'day':
        const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
        return metrics.filter(m => new Date(m.timestamp) > dayAgo);
        
      case 'week':
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        return metrics.filter(m => new Date(m.timestamp) > weekAgo);
        
      case 'month':
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        return metrics.filter(m => new Date(m.timestamp) > monthAgo);
        
      default:
        return metrics;
    }
  },
  
  /**
   * Analyser les tendances de performance
   */
  calculatePerformanceTrend(metrics) {
    if (metrics.length < 10) return 'insufficient_data';
    
    // Comparer les 10 derniers avec les 10 précédents
    const recent = metrics.slice(-10);
    const previous = metrics.slice(-20, -10);
    
    const recentAvg = this.average(recent.map(m => m.duration));
    const previousAvg = this.average(previous.map(m => m.duration));
    
    const improvement = ((previousAvg - recentAvg) / previousAvg) * 100;
    
    return {
      trend: improvement > 0 ? 'improving' : 'degrading',
      percentage: Math.abs(improvement),
      recentAvg,
      previousAvg
    };
  },
  
  /**
   * Analyser l'extraction des champs
   */
  analyzeFieldExtraction(successfulMetrics) {
    const fields = [
      'supplier.name', 'supplier.vatNumber', 'supplier.email',
      'invoice.number', 'invoice.date', 
      'amounts.total', 'amounts.tax',
      'banking.iban'
    ];
    
    const stats = {};
    
    fields.forEach(field => {
      const extracted = successfulMetrics.filter(m => {
        const value = this.getNestedValue(m.extractedFields, field);
        return value !== null && value !== undefined;
      });
      
      stats[field] = {
        extractionRate: (extracted.length / successfulMetrics.length) * 100,
        avgConfidence: this.average(extracted.map(m => m.confidence))
      };
    });
    
    return stats;
  },
  
  /**
   * Analyser les types d'erreurs
   */
  analyzeErrors(failedMetrics) {
    const errorTypes = {};
    
    failedMetrics.forEach(m => {
      const type = m.error?.type || 'unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    return errorTypes;
  },
  
  /**
   * Mise à jour des stats temps réel
   */
  updateRealTimeStats(metric) {
    // Émettre un événement pour les composants UI
    window.dispatchEvent(new CustomEvent('ocr-realtime-update', {
      detail: {
        metric,
        stats: this.getStats('hour')
      }
    }));
  },
  
  /**
   * Exporter les métriques
   */
  exportMetrics(format = 'json') {
    const metrics = this.getAllMetrics();
    const stats = this.getStats();
    
    const data = {
      exportDate: new Date().toISOString(),
      metrics,
      stats
    };
    
    switch(format) {
      case 'json':
        return JSON.stringify(data, null, 2);
        
      case 'csv':
        return this.convertToCSV(metrics);
        
      default:
        return data;
    }
  },
  
  /**
   * Nettoyer les anciennes métriques
   */
  cleanup(daysToKeep = 30) {
    const metrics = this.getAllMetrics();
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const filtered = metrics.filter(m => new Date(m.timestamp) > cutoffDate);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      removed: metrics.length - filtered.length,
      remaining: filtered.length
    };
  },
  
  // Utilitaires
  generateId() {
    return 'ocr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },
  
  average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  },
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  },
  
  groupByProperty(array, property) {
    return array.reduce((acc, item) => {
      const key = item[property];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  },
  
  convertToCSV(metrics) {
    const headers = ['id', 'timestamp', 'mode', 'duration', 'success', 'confidence', 'fileType', 'fileSize'];
    const rows = metrics.map(m => headers.map(h => m[h] || '').join(','));
    return [headers.join(','), ...rows].join('\n');
  },
  
  getEmptyStats() {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      successRate: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      avgConfidence: 0,
      avgFileSize: 0,
      byMode: {
        docker: { count: 0, percentage: 0, avgDuration: 0, successRate: 0 },
        fallback: { count: 0, percentage: 0, avgDuration: 0, successRate: 0 },
        cache: { count: 0, percentage: 0, avgDuration: 0 }
      },
      byFileType: {},
      errorTypes: {},
      performanceTrend: 'insufficient_data',
      fieldExtractionStats: {}
    };
  }
};

// Export global
window.OCRMetrics = OCRMetrics;