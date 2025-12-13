/**
 * Unified Accounting Module - Main Entry Point
 * =============================================
 * 
 * Point d'entrée principal du module comptable unifié.
 * Remplace les 10 fichiers accounting-engine.js dispersés.
 * 
 * @version 2.1.0
 * @updated 2025-01-13
 */

const AccountingEngine = require('./core/accounting-engine');

// Export du module unifié
module.exports = AccountingEngine;