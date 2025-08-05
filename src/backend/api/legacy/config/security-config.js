/**
 * Security Configuration - Portal Multi-Rôles
 * Configuration sécurité et protection
 */

// Security Configuration
const SecurityConfig = {
    // Content Security Policy
    CSP: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net', 'code.jquery.com', 'www.google-analytics.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:', 'ui-avatars.com'],
        'font-src': ["'self'", 'cdn.jsdelivr.net', 'fonts.gstatic.com'],
        'connect-src': ["'self'", 'api.portal.com', 'wss://api.portal.com'],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': []
    },
    
    // Headers sécurité
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'same-origin'
    },
    
    // Validation patterns
    validators: {
        email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{2,6}$/,
        phoneSwiss: /^(\+41|0041|0)?[1-9]{1}[0-9]{1,2}[\s]?[0-9]{3}[\s]?[0-9]{2}[\s]?[0-9]{2}$/,
        amount: /^\d{1,3}('?\d{3})*(\.\d{1,2})?$/,
        url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        alphanumeric: /^[a-zA-Z0-9]+$/,
        numeric: /^\d+$/,
        date: /^\d{4}-\d{2}-\d{2}$/,
        time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        iban: /^CH\d{2}[A-Z0-9]{17}$/,
        swissZip: /^[1-9]\d{3}$/
    },
    
    // Sanitization des inputs
    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') return input;
        
        // Trim
        input = input.trim();
        
        // HTML entities
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        switch (type) {
            case 'html':
                // Supprimer tout HTML
                return input.replace(/<[^>]*>?/gm, '');
                
            case 'text':
                // Échapper caractères dangereux
                return input.replace(/[&<>"'`=\/]/g, char => htmlEntities[char]);
                
            case 'email':
                // Lowercase et validation basique
                input = input.toLowerCase();
                return this.validators.email.test(input) ? input : '';
                
            case 'phone':
                // Garder que chiffres et +
                return input.replace(/[^\d+\s\-()]/g, '');
                
            case 'amount':
                // Garder que chiffres, apostrophe et point
                return input.replace(/[^\d'.]/g, '');
                
            case 'url':
                // Validation URL
                return this.validators.url.test(input) ? input : '';
                
            case 'filename':
                // Caractères safe pour noms de fichiers
                return input.replace(/[^a-zA-Z0-9\-_.]/g, '_');
                
            default:
                return this.sanitizeInput(input, 'text');
        }
    },
    
    // Validation des données
    validate(value, type, required = false) {
        // Vérifier si requis
        if (required && (!value || value.toString().trim() === '')) {
            return {
                valid: false,
                error: 'Ce champ est requis'
            };
        }
        
        // Si pas requis et vide, c'est valide
        if (!required && (!value || value.toString().trim() === '')) {
            return { valid: true };
        }
        
        // Validation selon type
        const validator = this.validators[type];
        if (!validator) {
            return { valid: true }; // Pas de validateur = OK
        }
        
        const valid = validator.test(value);
        
        if (!valid) {
            const errorMessages = {
                email: 'Email invalide',
                phone: 'Numéro de téléphone invalide',
                phoneSwiss: 'Numéro de téléphone suisse invalide',
                amount: 'Montant invalide',
                url: 'URL invalide',
                password: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
                iban: 'IBAN suisse invalide',
                swissZip: 'Code postal suisse invalide'
            };
            
            return {
                valid: false,
                error: errorMessages[type] || 'Valeur invalide'
            };
        }
        
        return { valid: true };
    },
    
    // Génération de tokens CSRF
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // Vérification CSRF
    verifyCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf-token');
        return token === storedToken;
    },
    
    // Rate limiting
    rateLimiter: {
        attempts: new Map(),
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        
        check(identifier) {
            const now = Date.now();
            const userAttempts = this.attempts.get(identifier) || [];
            
            // Nettoyer anciennes tentatives
            const recentAttempts = userAttempts.filter(
                timestamp => now - timestamp < this.windowMs
            );
            
            if (recentAttempts.length >= this.maxAttempts) {
                return {
                    allowed: false,
                    retryAfter: Math.ceil((recentAttempts[0] + this.windowMs - now) / 1000)
                };
            }
            
            // Enregistrer nouvelle tentative
            recentAttempts.push(now);
            this.attempts.set(identifier, recentAttempts);
            
            return { allowed: true };
        },
        
        reset(identifier) {
            this.attempts.delete(identifier);
        }
    },
    
    // Encryption/Decryption pour données sensibles
    crypto: {
        async encrypt(text, password) {
            const enc = new TextEncoder();
            const dec = new TextDecoder();
            
            // Générer clé depuis password
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                enc.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );
            
            // Générer salt aléatoire
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            
            // Dériver clé
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt']
            );
            
            // Générer IV
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypter
            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                enc.encode(text)
            );
            
            // Combiner salt + iv + encrypted
            const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            // Retourner base64
            return btoa(String.fromCharCode(...combined));
        },
        
        async decrypt(encryptedBase64, password) {
            const enc = new TextEncoder();
            const dec = new TextDecoder();
            
            // Décoder base64
            const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            
            // Extraire salt, iv et données
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);
            
            // Générer clé depuis password
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                enc.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );
            
            // Dériver clé
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['decrypt']
            );
            
            // Décrypter
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            return dec.decode(decrypted);
        }
    },
    
    // Vérification intégrité fichiers
    async calculateFileHash(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // Protection XSS pour affichage
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    
    // Configuration CORS
    corsConfig: {
        allowedOrigins: [
            'https://portal.company.ch',
            'https://api.portal.company.ch'
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        credentials: true,
        maxAge: 86400 // 24 heures
    },
    
    // Vérifier origine requête
    isAllowedOrigin(origin) {
        return this.corsConfig.allowedOrigins.includes(origin);
    },
    
    // Session security
    sessionConfig: {
        timeout: 30 * 60 * 1000, // 30 minutes
        warningTime: 5 * 60 * 1000, // Warning 5 min avant
        
        startTimer() {
            this.resetTimer();
            
            // Events qui reset le timer
            ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, () => this.resetTimer(), true);
            });
        },
        
        resetTimer() {
            clearTimeout(this.warnTimeout);
            clearTimeout(this.logoutTimeout);
            
            // Warning timeout
            this.warnTimeout = setTimeout(() => {
                this.showSessionWarning();
            }, this.timeout - this.warningTime);
            
            // Logout timeout
            this.logoutTimeout = setTimeout(() => {
                this.forceLogout();
            }, this.timeout);
        },
        
        showSessionWarning() {
            if (window.PortalApp) {
                PortalApp.showToast('Votre session expire dans 5 minutes', 'warning');
            }
        },
        
        forceLogout() {
            window.location.href = '/logout';
        }
    },
    
    // Initialize security
    init() {
        // Set CSP header via meta tag
        const cspContent = Object.entries(this.CSP)
            .map(([directive, values]) => `${directive} ${values.join(' ')}`)
            .join('; ');
        
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspContent;
        document.head.appendChild(meta);
        
        // Generate and store CSRF token
        const csrfToken = this.generateCSRFToken();
        sessionStorage.setItem('csrf-token', csrfToken);
        
        // Add CSRF token to all forms
        document.querySelectorAll('form').forEach(form => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_csrf';
            input.value = csrfToken;
            form.appendChild(input);
        });
        
        // Start session timer
        this.sessionConfig.startTimer();
        
        console.log('🔒 Security configuration initialized');
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityConfig;
}