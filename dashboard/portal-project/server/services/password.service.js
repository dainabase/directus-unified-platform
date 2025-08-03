const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12; // Sécurité élevée

class PasswordService {
  /**
   * Hash un mot de passe
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<string>} Hash bcrypt
   */
  static async hash(password) {
    if (!password || password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Vérifie un mot de passe contre un hash
   * @param {string} password - Mot de passe en clair
   * @param {string} hash - Hash bcrypt
   * @returns {Promise<boolean>} true si match
   */
  static async verify(password, hash) {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
  }

  /**
   * Valide la force d'un mot de passe
   * @param {string} password 
   * @returns {{valid: boolean, errors: string[]}}
   */
  static validateStrength(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Minimum 8 caractères requis');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une majuscule requise');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Au moins une minuscule requise');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Au moins un chiffre requis');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Au moins un caractère spécial requis');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Génère un mot de passe sécurisé aléatoire
   * @param {number} length - Longueur du mot de passe (défaut: 16)
   * @returns {string} Mot de passe généré
   */
  static generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Garantir au moins un de chaque type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)];
    
    // Remplir le reste
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Vérifie si un mot de passe a été compromis (HaveIBeenPwned)
   * @param {string} password 
   * @returns {Promise<boolean>} true si compromis
   */
  static async isCompromised(password) {
    try {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.substr(0, 5);
      const suffix = hash.substr(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();
      
      return data.includes(suffix);
    } catch (error) {
      console.error('Erreur vérification mot de passe compromis:', error);
      return false; // En cas d'erreur, on laisse passer
    }
  }
}

module.exports = PasswordService;