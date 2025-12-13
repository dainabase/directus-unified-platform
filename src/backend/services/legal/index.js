/**
 * Legal Services Index
 * Point d'entrée unique pour tous les services Légaux
 */

// Services individuels
export { cgvService } from './cgv.service.js';
export { signatureService } from './signature.service.js';

// Export par défaut: service CGV
export { cgvService as default } from './cgv.service.js';