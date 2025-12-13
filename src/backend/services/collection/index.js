/**
 * Collection Services Index
 * Point d'entrée unique pour tous les services de Recouvrement
 */

// Services individuels
export { collectionService } from './collection.service.js';
export { interestCalculator } from './interest-calculator.js';
export { reminderService } from './reminder.service.js';
export { lpIntegrationService } from './lp-integration.service.js';

// Export par défaut: service principal
export { collectionService as default } from './collection.service.js';