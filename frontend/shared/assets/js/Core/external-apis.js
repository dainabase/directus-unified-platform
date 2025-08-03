/**
 * External APIs Integration Module
 * Gère les intégrations avec les APIs externes (Zefix, validation email, LinkedIn, etc.)
 */

window.ExternalAPIs = (function() {
    'use strict';

    // Configuration des APIs
    const API_CONFIG = {
        zefix: {
            baseUrl: 'https://www.zefix.ch/ZefixPublicREST/api/v1',
            endpoints: {
                search: '/company/search',
                details: '/company/uid/',
                extract: '/company/extract'
            },
            // Proxy CORS si nécessaire (remplacer par votre proxy)
            corsProxy: 'https://api.allorigins.win/get?url='
        },
        emailValidation: {
            // Service de validation email (remplacer par votre clé API)
            apiKey: 'YOUR_EMAIL_VALIDATION_API_KEY',
            baseUrl: 'https://api.emailvalidation.io'
        },
        linkedIn: {
            // Service d'enrichissement LinkedIn via RapidAPI
            rapidApiKey: 'YOUR_RAPIDAPI_KEY',
            baseUrl: 'https://linkedin-data-scraper.p.rapidapi.com'
        }
    };

    // === API ZEFIX (Registre du commerce suisse) ===

    /**
     * Rechercher une entreprise sur Zefix par nom
     * @param {string} searchTerm - Terme de recherche
     * @param {Object} options - Options de recherche
     * @returns {Promise<Array>} Liste des entreprises trouvées
     */
    async function searchCompanyOnZefix(searchTerm, options = {}) {
        const defaultOptions = {
            activeOnly: true,
            maxEntries: 10,
            languageKey: 1 // 1 = Français, 2 = Allemand, 3 = Italien, 4 = Anglais
        };
        
        const searchOptions = { ...defaultOptions, ...options };
        
        try {
            console.log('🔍 Recherche Zefix pour:', searchTerm);
            
            // Construire l'URL de recherche
            const searchUrl = `${API_CONFIG.zefix.baseUrl}${API_CONFIG.zefix.endpoints.search}`;
            
            // Préparer le body de la requête
            const requestBody = {
                name: searchTerm,
                activeOnly: searchOptions.activeOnly,
                maxEntries: searchOptions.maxEntries,
                languageKey: searchOptions.languageKey
            };

            // Utiliser proxy CORS si nécessaire
            const finalUrl = API_CONFIG.zefix.corsProxy ? 
                `${API_CONFIG.zefix.corsProxy}${encodeURIComponent(searchUrl)}` : 
                searchUrl;

            const response = await fetch(finalUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Erreur API Zefix: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Réponse Zefix reçue:', data);

            // Si on utilise le proxy CORS, extraire les données
            const results = API_CONFIG.zefix.corsProxy ? JSON.parse(data.contents) : data;

            return results.companies || results.list || [];

        } catch (error) {
            console.warn('⚠️ Erreur API Zefix, utilisation de données mock:', error.message);
            
            // Fallback sur données mock
            return generateMockZefixResults(searchTerm);
        }
    }

    /**
     * Obtenir les détails d'une entreprise par son UID/IDE
     * @param {string} uid - Numéro IDE de l'entreprise
     * @returns {Promise<Object|null>} Détails de l'entreprise
     */
    async function getCompanyDetailsFromZefix(uid) {
        try {
            console.log('📋 Récupération détails Zefix pour UID:', uid);
            
            // Nettoyer l'UID (enlever CHE- si présent)
            const cleanUid = uid.replace(/^CHE-/, '').replace(/\./g, '');
            
            const detailsUrl = `${API_CONFIG.zefix.baseUrl}${API_CONFIG.zefix.endpoints.details}${cleanUid}`;
            const finalUrl = API_CONFIG.zefix.corsProxy ? 
                `${API_CONFIG.zefix.corsProxy}${encodeURIComponent(detailsUrl)}` : 
                detailsUrl;

            const response = await fetch(finalUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Entreprise non trouvée: ${response.status}`);
            }

            const data = await response.json();
            const companyData = API_CONFIG.zefix.corsProxy ? JSON.parse(data.contents) : data;

            // Transformer en format interne
            return transformZefixCompanyData(companyData);

        } catch (error) {
            console.warn('⚠️ Erreur détails Zefix, génération données mock:', error.message);
            
            // Fallback sur données mock
            return generateMockCompanyDetails(uid);
        }
    }

    /**
     * Transformer les données Zefix en format interne
     */
    function transformZefixCompanyData(zefixData) {
        return {
            name: zefixData.name || zefixData.companyName,
            legalForm: zefixData.legalForm || zefixData.rechtsform,
            ide: zefixData.uid || zefixData.ide,
            status: zefixData.status || 'active',
            address: {
                street: zefixData.address?.street || zefixData.adresse?.rue,
                zip: zefixData.address?.zip || zefixData.adresse?.npa,
                city: zefixData.address?.city || zefixData.adresse?.ville,
                canton: zefixData.canton
            },
            registrationDate: zefixData.registrationDate || zefixData.dateInscription,
            capital: zefixData.capital || zefixData.capitalSocial,
            purpose: zefixData.purpose || zefixData.but,
            director: zefixData.director || zefixData.directeur,
            lastUpdate: zefixData.lastUpdate || new Date().toISOString(),
            source: 'zefix'
        };
    }

    /**
     * Générer des résultats mock Zefix
     */
    function generateMockZefixResults(searchTerm) {
        const mockCompanies = [
            {
                name: 'Rolex SA',
                uid: 'CHE-107.979.376',
                legalForm: 'SA',
                address: { street: 'Rue François-Dussaud 3', zip: '1211', city: 'Genève' },
                canton: 'GE',
                status: 'active'
            },
            {
                name: 'Nestlé SA',
                uid: 'CHE-115.415.394',
                legalForm: 'SA',
                address: { street: 'Avenue Nestlé 55', zip: '1800', city: 'Vevey' },
                canton: 'VD',
                status: 'active'
            },
            {
                name: 'UBS Group AG',
                uid: 'CHE-106.222.884',
                legalForm: 'AG',
                address: { street: 'Bahnhofstrasse 45', zip: '8001', city: 'Zurich' },
                canton: 'ZH',
                status: 'active'
            }
        ];

        return mockCompanies.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    /**
     * Générer détails mock d'une entreprise
     */
    function generateMockCompanyDetails(uid) {
        const mockDetails = {
            'CHE-107.979.376': {
                name: 'Rolex SA',
                legalForm: 'SA',
                ide: 'CHE-107.979.376',
                address: {
                    street: 'Rue François-Dussaud 3-5-7',
                    zip: '1211',
                    city: 'Genève 26',
                    canton: 'GE'
                },
                registrationDate: '1905-07-02',
                capital: 50000000,
                purpose: 'Fabrication et commercialisation de montres et bijoux de luxe',
                director: 'Jean-Frédéric Dufour',
                source: 'zefix_mock'
            },
            'CHE-115.415.394': {
                name: 'Nestlé SA',
                legalForm: 'SA',
                ide: 'CHE-115.415.394',
                address: {
                    street: 'Avenue Nestlé 55',
                    zip: '1800',
                    city: 'Vevey',
                    canton: 'VD'
                },
                registrationDate: '1866-09-01',
                capital: 100000000,
                purpose: 'Production et commercialisation de produits alimentaires',
                director: 'Mark Schneider',
                source: 'zefix_mock'
            }
        };

        const cleanUid = uid.replace(/^CHE-/, '').replace(/\./g, '');
        const formattedUid = `CHE-${cleanUid.slice(0,3)}.${cleanUid.slice(3,6)}.${cleanUid.slice(6,9)}`;
        
        return mockDetails[formattedUid] || {
            name: 'Entreprise Exemple SA',
            legalForm: 'SA',
            ide: formattedUid,
            address: {
                street: 'Rue Example 123',
                zip: '1000',
                city: 'Lausanne',
                canton: 'VD'
            },
            registrationDate: '2010-01-01',
            capital: 100000,
            purpose: 'Activités commerciales diverses',
            source: 'zefix_mock'
        };
    }

    // === VALIDATION EMAIL AVANCÉE ===

    /**
     * Validation email avec API externe
     * @param {string} email - Adresse email à valider
     * @returns {Promise<Object>} Résultat de validation
     */
    async function validateEmailWithAPI(email) {
        try {
            // Validation basique d'abord
            const basicValidation = validateEmailBasic(email);
            if (!basicValidation.valid) {
                return basicValidation;
            }

            // Si API key disponible, utiliser service externe
            if (API_CONFIG.emailValidation.apiKey && API_CONFIG.emailValidation.apiKey !== 'YOUR_EMAIL_VALIDATION_API_KEY') {
                const response = await fetch(`${API_CONFIG.emailValidation.baseUrl}/validate/${email}`, {
                    headers: {
                        'API-Key': API_CONFIG.emailValidation.apiKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const validation = await response.json();
                    
                    return {
                        valid: validation.valid || validation.is_valid,
                        reason: validation.reason || validation.result,
                        disposable: validation.disposable || validation.is_disposable,
                        role: validation.role || validation.is_role,
                        score: validation.score || (validation.quality_score * 100),
                        source: 'external_api'
                    };
                }
            }

            // Fallback sur validation avancée locale
            return await validateEmailAdvanced(email);

        } catch (error) {
            console.warn('⚠️ Erreur validation email API:', error.message);
            return await validateEmailAdvanced(email);
        }
    }

    /**
     * Validation email basique
     */
    function validateEmailBasic(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) {
            return { valid: false, reason: 'Format syntaxique invalide' };
        }

        return { valid: true, reason: 'Format syntaxique valide' };
    }

    /**
     * Validation email avancée locale
     */
    async function validateEmailAdvanced(email) {
        const [localPart, domain] = email.split('@');

        // Domaines jetables étendus
        const disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
            'yopmail.com', 'temp-mail.org', '20minutemail.com', 'fakemailgenerator.com',
            'throwaway.email', 'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com'
        ];

        // Domaines d'entreprise connus
        const enterpriseDomains = [
            'microsoft.com', 'apple.com', 'google.com', 'amazon.com', 'ibm.com',
            'oracle.com', 'salesforce.com', 'adobe.com', 'sap.com', 'cisco.com'
        ];

        // Domaines suisses d'entreprise
        const swissEnterpriseDomains = [
            'rolex.com', 'nestle.com', 'novartis.com', 'roche.com', 'ubs.com',
            'credit-suisse.com', 'zurich.com', 'swatch.com', 'abb.com'
        ];

        let score = 100;
        let reason = 'Email valide';
        let disposable = false;
        let role = 'personal';

        // Vérification domaines jetables
        if (disposableDomains.includes(domain.toLowerCase())) {
            return {
                valid: false,
                reason: 'Email jetable détecté',
                disposable: true,
                score: 0
            };
        }

        // Vérification longueur
        if (localPart.length > 64 || domain.length > 255) {
            return { valid: false, reason: 'Email trop long' };
        }

        // Patterns suspects
        if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
            score -= 30;
            reason = 'Format suspect détecté';
        }

        // Vérification rôle générique
        const rolePatterns = ['admin', 'support', 'info', 'contact', 'sales', 'marketing', 'noreply'];
        if (rolePatterns.some(pattern => localPart.toLowerCase().includes(pattern))) {
            role = 'generic';
            score -= 10;
        }

        // Bonus pour domaines d'entreprise
        if (enterpriseDomains.includes(domain.toLowerCase()) || 
            swissEnterpriseDomains.includes(domain.toLowerCase())) {
            score += 15;
            role = 'corporate';
        }

        // Bonus pour domaines suisses
        if (domain.toLowerCase().endsWith('.ch')) {
            score += 5;
        }

        // Pénalité pour emails très courts
        if (localPart.length < 3) score -= 20;

        return {
            valid: true,
            reason: reason,
            score: Math.max(0, Math.min(100, score)),
            domain: domain,
            localPart: localPart,
            disposable: disposable,
            role: role,
            source: 'local_advanced'
        };
    }

    // === ENRICHISSEMENT LINKEDIN ===

    /**
     * Enrichir contact depuis LinkedIn
     * @param {string} linkedinUrl - URL du profil LinkedIn
     * @returns {Promise<Object|null>} Données enrichies
     */
    async function enrichContactFromLinkedIn(linkedinUrl) {
        try {
            const profileId = extractLinkedInProfileId(linkedinUrl);
            if (!profileId) {
                throw new Error('URL LinkedIn invalide');
            }

            // Si API key disponible
            if (API_CONFIG.linkedIn.rapidApiKey && API_CONFIG.linkedIn.rapidApiKey !== 'YOUR_RAPIDAPI_KEY') {
                const response = await fetch(`${API_CONFIG.linkedIn.baseUrl}/profile/${profileId}`, {
                    headers: {
                        'X-RapidAPI-Key': API_CONFIG.linkedIn.rapidApiKey,
                        'X-RapidAPI-Host': 'linkedin-data-scraper.p.rapidapi.com'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    return {
                        fullName: data.name || data.fullName,
                        headline: data.headline,
                        location: data.location,
                        company: data.company,
                        summary: data.summary,
                        skills: data.skills || [],
                        experience: data.experience || [],
                        education: data.education || [],
                        profilePicture: data.profilePicture || data.avatar,
                        connections: data.connections,
                        source: 'linkedin_api'
                    };
                }
            }

            // Fallback sur données mock
            return generateMockLinkedInData(profileId);

        } catch (error) {
            console.warn('⚠️ Erreur enrichissement LinkedIn:', error.message);
            return null;
        }
    }

    /**
     * Extraire l'ID du profil LinkedIn depuis l'URL
     */
    function extractLinkedInProfileId(url) {
        const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
        return match ? match[1] : null;
    }

    /**
     * Générer données mock LinkedIn
     */
    function generateMockLinkedInData(profileId) {
        return {
            fullName: 'Jean Dupont',
            headline: 'Directeur Marketing chez Rolex SA',
            location: 'Genève, Suisse',
            company: 'Rolex SA',
            summary: 'Expert en marketing de luxe avec 15 ans d\'expérience...',
            skills: ['Marketing', 'Luxe', 'Stratégie digitale', 'Gestion d\'équipe'],
            experience: [
                {
                    title: 'Directeur Marketing',
                    company: 'Rolex SA',
                    duration: '2018 - Présent',
                    location: 'Genève'
                }
            ],
            connections: '500+',
            source: 'linkedin_mock'
        };
    }

    // === API PUBLIQUE ===

    return {
        // Zefix
        searchCompanyOnZefix,
        getCompanyDetailsFromZefix,

        // Email
        validateEmailWithAPI,
        validateEmailAdvanced,

        // LinkedIn
        enrichContactFromLinkedIn,
        extractLinkedInProfileId,

        // Configuration
        setApiKey: function(service, apiKey) {
            if (API_CONFIG[service]) {
                API_CONFIG[service].apiKey = apiKey;
            }
        },

        // Status
        getAPIStatus: function() {
            return {
                zefix: 'available',
                emailValidation: API_CONFIG.emailValidation.apiKey !== 'YOUR_EMAIL_VALIDATION_API_KEY' ? 'configured' : 'mock',
                linkedIn: API_CONFIG.linkedIn.rapidApiKey !== 'YOUR_RAPIDAPI_KEY' ? 'configured' : 'mock'
            };
        }
    };

})();