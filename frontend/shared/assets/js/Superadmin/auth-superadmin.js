/**
 * Module d'authentification Superadmin avec 2FA
 * Basé sur auth-notion-v2.js avec sécurité renforcée
 */
window.AuthSuperadmin = (function() {
    'use strict';

    // Configuration
    const config = {
        sessionDuration: 30 * 60 * 1000, // 30 minutes
        refreshThreshold: 5 * 60 * 1000, // Refresh 5 min avant expiration
        twoFactorRequired: true,
        ipWhitelistEnabled: true,
        auditEnabled: true,
        
        // IPs autorisées (à configurer en production)
        allowedIPs: [
            '127.0.0.1',
            '::1',
            // Ajouter IPs bureau : '192.168.1.0/24'
            // Ajouter VPN : '10.0.0.0/8'
        ],
        
        // Configuration 2FA
        twoFactorSettings: {
            issuer: 'Dashboard Groupe',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            windowSize: 2 // Tolérance de 2 périodes
        }
    };

    // État local
    let currentUser = null;
    let sessionTimer = null;
    let refreshTimer = null;
    let twoFactorVerified = false;

    /**
     * Initialisation du module
     */
    function init() {
        // Vérifier session existante
        const session = getSession();
        if (session) {
            if (isSessionValid(session)) {
                currentUser = session.user;
                twoFactorVerified = session.twoFactorVerified || false;
                startSessionTimers();
                
                // Vérifier 2FA si pas encore fait
                if (!twoFactorVerified && window.location.pathname !== '/portal-project/superadmin/2fa-verify.html') {
                    window.location.href = '/portal-project/superadmin/2fa-verify.html';
                }
            } else {
                logout();
            }
        }
        
        // Intercepter toutes les requêtes API
        interceptApiCalls();
    }

    /**
     * Login superadmin avec vérification IP
     */
    async function login(email, password) {
        try {
            // Vérifier IP si whitelist activée
            if (config.ipWhitelistEnabled) {
                const clientIP = await getClientIP();
                if (!isIPAllowed(clientIP)) {
                    throw new Error('Accès refusé : IP non autorisée');
                }
            }

            // Authentification de base (réutilise auth-notion.js)
            const authResult = await window.AuthNotionModule.authenticateUser(email, password);
            
            // Vérifier que c'est bien un superadmin
            if (!authResult.success) {
                throw new Error(authResult.reason || 'Authentification échouée');
            }
            
            if (!authResult.user.roles.includes('superadmin')) {
                throw new Error('Accès refusé : rôle superadmin requis');
            }

            // Créer session courte sans 2FA
            const session = {
                user: authResult.user,
                token: 'dev_token_' + Date.now(), // Token simulé en dev
                refreshToken: 'dev_refresh_' + Date.now(),
                expiresAt: Date.now() + config.sessionDuration,
                createdAt: Date.now(),
                clientIP: await getClientIP(),
                twoFactorVerified: false
            };

            // Sauvegarder session
            saveSession(session);
            currentUser = authResult.user;
            
            // Logger l'événement
            await logAuditEvent('LOGIN_ATTEMPT', {
                email,
                ip: session.clientIP,
                success: true
            });

            // Rediriger vers 2FA
            return {
                success: true,
                requiresTwoFactor: true,
                redirectTo: '/portal-project/superadmin/2fa-verify.html'
            };

        } catch (error) {
            // Logger l'échec
            await logAuditEvent('LOGIN_FAILED', {
                email,
                ip: await getClientIP(),
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Vérifier le code 2FA
     */
    async function verifyTwoFactor(code) {
        if (!currentUser) {
            throw new Error('Session invalide');
        }

        try {
            // En dev : accepter '123456' comme code de test
            // En prod : vérifier avec la vraie clé secrète
            const isValid = isDevelopment() ? 
                code === '123456' : 
                await verifyTOTP(currentUser.totpSecret, code);

            if (!isValid) {
                throw new Error('Code 2FA invalide');
            }

            // Marquer 2FA comme vérifié
            const session = getSession();
            session.twoFactorVerified = true;
            session.twoFactorVerifiedAt = Date.now();
            saveSession(session);
            twoFactorVerified = true;

            // Démarrer les timers de session
            startSessionTimers();

            // Logger succès
            await logAuditEvent('2FA_VERIFIED', {
                userId: currentUser.id,
                method: 'TOTP'
            });

            return {
                success: true,
                redirectTo: '/portal-project/superadmin/dashboard.html'
            };

        } catch (error) {
            // Logger échec
            await logAuditEvent('2FA_FAILED', {
                userId: currentUser.id,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Setup 2FA pour un nouveau superadmin
     */
    async function setupTwoFactor() {
        if (!currentUser || !currentUser.roles.includes('superadmin')) {
            throw new Error('Accès non autorisé');
        }

        // Générer secret
        const secret = generateTOTPSecret();
        
        // Créer QR code
        const qrCodeUrl = generateQRCodeUrl({
            secret,
            label: currentUser.email,
            issuer: config.twoFactorSettings.issuer
        });

        return {
            secret,
            qrCodeUrl,
            manualEntryKey: formatSecretForManualEntry(secret)
        };
    }

    /**
     * Gestion des timers de session
     */
    function startSessionTimers() {
        // Clear existing timers
        if (sessionTimer) clearTimeout(sessionTimer);
        if (refreshTimer) clearTimeout(refreshTimer);

        // Timer pour expiration session
        sessionTimer = setTimeout(() => {
            logout('Session expirée');
        }, config.sessionDuration);

        // Timer pour refresh automatique
        refreshTimer = setTimeout(() => {
            refreshSession();
        }, config.sessionDuration - config.refreshThreshold);
    }

    /**
     * Refresh de session
     */
    async function refreshSession() {
        try {
            const session = getSession();
            if (!session || !session.refreshToken) {
                throw new Error('Pas de refresh token');
            }

            // En dev : simuler refresh
            if (isDevelopment()) {
                session.token = 'dev_token_' + Date.now();
                session.expiresAt = Date.now() + config.sessionDuration;
                saveSession(session);
                startSessionTimers();
                
                await logAuditEvent('SESSION_REFRESHED', {
                    userId: currentUser.id
                });
                return;
            }

            // En prod : appeler l'API pour refresh
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.refreshToken}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    sessionId: session.id
                })
            });

            if (!response.ok) {
                throw new Error('Refresh échoué');
            }

            const data = await response.json();
            
            // Mettre à jour session
            session.token = data.token;
            session.expiresAt = Date.now() + config.sessionDuration;
            saveSession(session);

            // Redémarrer timers
            startSessionTimers();

            // Logger
            await logAuditEvent('SESSION_REFRESHED', {
                userId: currentUser.id
            });

        } catch (error) {
            console.error('Erreur refresh session:', error);
            logout('Session expirée');
        }
    }

    /**
     * Intercepter les appels API pour ajouter sécurité
     */
    function interceptApiCalls() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const [url, options = {}] = args;
            
            // Si c'est une API superadmin
            if (url.includes('/api/superadmin/')) {
                // Vérifier session et 2FA
                if (!isAuthenticated() || !twoFactorVerified) {
                    window.location.href = '/portal-project/login.html';
                    throw new Error('Non authentifié');
                }
                
                // Ajouter headers sécurité
                options.headers = {
                    ...options.headers,
                    'X-Superadmin-Session': getSession().id,
                    'X-Client-IP': await getClientIP(),
                    'X-2FA-Verified': twoFactorVerified.toString()
                };
            }
            
            return originalFetch.apply(this, [url, options]);
        };
    }

    /**
     * Logout avec audit
     */
    async function logout(reason = 'Manuel') {
        if (currentUser) {
            await logAuditEvent('LOGOUT', {
                userId: currentUser.id,
                reason
            });
        }

        // Clear timers
        if (sessionTimer) clearTimeout(sessionTimer);
        if (refreshTimer) clearTimeout(refreshTimer);

        // Clear session
        sessionStorage.removeItem('superadmin_session');
        currentUser = null;
        twoFactorVerified = false;

        // Rediriger
        window.location.href = '/portal-project/login.html';
    }

    /**
     * Vérifications de sécurité
     */
    function isAuthenticated() {
        const session = getSession();
        return session && isSessionValid(session) && currentUser;
    }

    function isSessionValid(session) {
        return session && 
               session.expiresAt > Date.now() &&
               session.user &&
               session.user.roles.includes('superadmin');
    }

    async function isIPAllowed(ip) {
        // En dev, toujours autoriser localhost
        if (isDevelopment()) return true;
        
        // Vérifier whitelist
        return config.allowedIPs.some(allowedIP => {
            // Support CIDR notation
            if (allowedIP.includes('/')) {
                return isIPInCIDR(ip, allowedIP);
            }
            return ip === allowedIP;
        });
    }

    /**
     * Utilitaires
     */
    function getSession() {
        const sessionStr = sessionStorage.getItem('superadmin_session');
        return sessionStr ? JSON.parse(sessionStr) : null;
    }

    function saveSession(session) {
        session.id = session.id || generateSessionId();
        sessionStorage.setItem('superadmin_session', JSON.stringify(session));
    }

    async function getClientIP() {
        // En dev, retourner localhost
        if (isDevelopment()) return '127.0.0.1';
        
        // En prod, utiliser un service ou header serveur
        try {
            const response = await fetch('/api/client-ip');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    /**
     * 2FA TOTP Implementation
     */
    function generateTOTPSecret() {
        // Générer 20 bytes aléatoires pour secret
        const array = new Uint8Array(20);
        window.crypto.getRandomValues(array);
        return base32Encode(array);
    }

    function generateQRCodeUrl(params) {
        const otpauthUrl = `otpauth://totp/${params.issuer}:${params.label}?secret=${params.secret}&issuer=${params.issuer}`;
        // Utiliser Google Charts API pour QR code (ou qrcode.js en local)
        return `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`;
    }

    function formatSecretForManualEntry(secret) {
        // Formater en groupes de 4 caractères
        return secret.match(/.{1,4}/g).join(' ');
    }

    async function verifyTOTP(secret, token) {
        // Implémentation simplifiée - en prod utiliser une lib crypto
        // ou vérifier côté serveur
        const counter = Math.floor(Date.now() / 1000 / config.twoFactorSettings.period);
        
        // Vérifier fenêtre de temps
        for (let i = -config.twoFactorSettings.windowSize; i <= config.twoFactorSettings.windowSize; i++) {
            const testCounter = counter + i;
            const expectedToken = await generateTOTP(secret, testCounter);
            if (token === expectedToken) {
                return true;
            }
        }
        
        return false;
    }

    async function generateTOTP(secret, counter) {
        // Implémentation TOTP simplifiée
        // En prod, utiliser une librairie crypto appropriée
        const key = base32Decode(secret);
        const hmac = await crypto.subtle.sign(
            'HMAC',
            await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'HMAC', hash: 'SHA-1' },
                false,
                ['sign']
            ),
            counterToBytes(counter)
        );
        
        const offset = new Uint8Array(hmac)[19] & 0xf;
        const code = (
            ((new Uint8Array(hmac)[offset] & 0x7f) << 24) |
            ((new Uint8Array(hmac)[offset + 1] & 0xff) << 16) |
            ((new Uint8Array(hmac)[offset + 2] & 0xff) << 8) |
            (new Uint8Array(hmac)[offset + 3] & 0xff)
        ) % Math.pow(10, config.twoFactorSettings.digits);
        
        return code.toString().padStart(config.twoFactorSettings.digits, '0');
    }

    /**
     * Audit logging
     */
    async function logAuditEvent(eventType, details) {
        if (!config.auditEnabled) return;
        
        const event = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            type: eventType,
            userId: currentUser?.id || 'anonymous',
            userEmail: currentUser?.email || 'anonymous',
            details,
            sessionId: getSession()?.id,
            clientIP: await getClientIP(),
            userAgent: navigator.userAgent
        };

        // Sauvegarder localement (en dev)
        const auditLog = JSON.parse(localStorage.getItem('superadmin_audit') || '[]');
        auditLog.push(event);
        
        // Garder seulement les 1000 derniers events
        if (auditLog.length > 1000) {
            auditLog.splice(0, auditLog.length - 1000);
        }
        
        localStorage.setItem('superadmin_audit', JSON.stringify(auditLog));

        // En prod, envoyer au serveur
        if (!isDevelopment()) {
            try {
                await fetch('/api/superadmin/audit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getSession()?.token}`
                    },
                    body: JSON.stringify(event)
                });
            } catch (error) {
                console.error('Erreur envoi audit:', error);
            }
        }
    }

    /**
     * Helpers Base32 (pour 2FA)
     */
    function base32Encode(buffer) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let output = '';

        for (let i = 0; i < buffer.length; i++) {
            value = (value << 8) | buffer[i];
            bits += 8;

            while (bits >= 5) {
                output += alphabet[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
        }

        if (bits > 0) {
            output += alphabet[(value << (5 - bits)) & 31];
        }

        return output;
    }

    function base32Decode(string) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const buffer = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < string.length; i++) {
            const idx = alphabet.indexOf(string[i].toUpperCase());
            if (idx === -1) continue;

            value = (value << 5) | idx;
            bits += 5;

            if (bits >= 8) {
                buffer.push((value >>> (bits - 8)) & 255);
                bits -= 8;
            }
        }

        return new Uint8Array(buffer);
    }

    function counterToBytes(counter) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setUint32(4, counter, false);
        return buffer;
    }

    function isIPInCIDR(ip, cidr) {
        // Implémentation simplifiée CIDR
        // En prod, utiliser une librairie appropriée
        const [subnet, prefixLength] = cidr.split('/');
        if (!prefixLength) return ip === subnet;
        
        // Convertir IPs en nombres
        const ipNum = ipToNumber(ip);
        const subnetNum = ipToNumber(subnet);
        const mask = (-1 << (32 - parseInt(prefixLength))) >>> 0;
        
        return (ipNum & mask) === (subnetNum & mask);
    }

    function ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    }

    // API publique
    return {
        init,
        login,
        logout,
        verifyTwoFactor,
        setupTwoFactor,
        isAuthenticated,
        getCurrentUser: () => currentUser,
        isTwoFactorVerified: () => twoFactorVerified,
        getSession,
        refreshSession,
        logAuditEvent
    };

})();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    window.AuthSuperadmin.init();
});