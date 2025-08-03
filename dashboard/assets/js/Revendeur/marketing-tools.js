/**
 * Marketing Tools & Reports Management
 * Gestion des outils marketing, commissions et rapports
 */

// Gestion bibliothèque marketing
class MarketingLibrary {
    constructor() {
        this.resources = this.loadResources();
        this.filters = {
            category: 'all',
            format: 'all',
            tags: []
        };
        this.initLibrary();
        this.initSearch();
    }
    
    // Charger les ressources (simulation)
    loadResources() {
        const saved = localStorage.getItem('marketing_resources');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Données d'exemple
        return [
            {
                id: 1,
                title: 'Présentation Corporate 2024',
                description: 'Présentation officielle de l\'entreprise incluant vision, produits et success stories',
                category: 'presentations',
                format: 'pptx',
                size: '18.5 MB',
                tags: ['nouveau', 'corporate', '2024'],
                downloads: 245,
                rating: 4.5,
                lastUpdate: new Date('2024-02-20'),
                thumbnail: 'presentation-analytics'
            },
            {
                id: 2,
                title: 'Pitch Deck Produits',
                description: 'Présentation complète de notre gamme de produits avec démonstrations',
                category: 'presentations',
                format: 'pptx',
                size: '24.3 MB',
                tags: ['populaire', 'produits', 'demo'],
                downloads: 389,
                rating: 5.0,
                lastUpdate: new Date('2024-02-15'),
                thumbnail: 'chart-pie'
            },
            {
                id: 3,
                title: 'Brochure Générale FR',
                description: 'Brochure commerciale complète en français avec tous nos services',
                category: 'brochures',
                format: 'pdf',
                size: '5.2 MB',
                tags: ['mis-a-jour', 'general', 'francais'],
                downloads: 512,
                rating: 4.2,
                lastUpdate: new Date('2024-02-22'),
                thumbnail: 'file-text'
            },
            {
                id: 4,
                title: 'Video Demo Produit',
                description: 'Démonstration vidéo complète de notre solution (5 min)',
                category: 'media',
                format: 'mp4',
                size: '125 MB',
                duration: '5:23',
                tags: ['nouveau', 'demo', 'hd'],
                downloads: 156,
                rating: 4.8,
                lastUpdate: new Date('2024-02-18'),
                thumbnail: 'movie'
            },
            {
                id: 5,
                title: 'Template Email Prospection',
                description: 'Modèle d\'email de prospection avec variantes selon secteur',
                category: 'templates',
                format: 'html',
                size: '45 KB',
                tags: ['populaire', 'email', 'prospection'],
                downloads: 723,
                rating: 4.9,
                lastUpdate: new Date('2024-02-17'),
                thumbnail: 'mail'
            }
        ];
    }
    
    // Initialiser la bibliothèque
    initLibrary() {
        console.log('📚 Bibliothèque marketing initialisée avec', this.resources.length, 'ressources');
    }
    
    // Initialiser la recherche
    initSearch() {
        const searchInput = document.getElementById('searchResources');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchResources(e.target.value);
            });
        }
    }
    
    // Recherche intelligente avec Fuse.js (simulée)
    searchResources(query) {
        if (!query) {
            return this.resources;
        }
        
        // Recherche simple dans titre, description et tags
        const results = this.resources.filter(resource => {
            const searchString = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });
        
        console.log(`Recherche "${query}": ${results.length} résultats`);
        return results;
    }
    
    // Filtrer ressources
    filterResources(filters) {
        let filtered = this.resources;
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(r => r.category === filters.category);
        }
        
        if (filters.format && filters.format !== 'all') {
            filtered = filtered.filter(r => r.format === filters.format);
        }
        
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(r => 
                filters.tags.some(tag => r.tags.includes(tag))
            );
        }
        
        return filtered;
    }
    
    // Tracking téléchargements
    trackDownload(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return null;
        
        // Analytics (simulation)
        console.log('📊 Tracking download:', {
            event: 'download',
            category: 'marketing_resource',
            label: resource.title,
            value: resource.downloads + 1
        });
        
        // Update stats
        resource.downloads++;
        resource.lastDownload = new Date();
        this.saveResources();
        
        // Generate personalized link
        return this.generateTrackingLink(resource);
    }
    
    // Générer lien de tracking personnalisé
    generateTrackingLink(resource) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const trackingParams = {
            rid: resource.id,
            uid: user.id || 'anonymous',
            ref: user.username || 'direct',
            ts: Date.now()
        };
        
        const baseUrl = `https://portal.company.ch/download/${resource.id}`;
        const queryString = new URLSearchParams(trackingParams).toString();
        
        return `${baseUrl}?${queryString}`;
    }
    
    // Personnalisation contenus
    personalizeResource(resourceId, userData) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return null;
        
        if (resource.type === 'presentation') {
            // Inject user data in PPT (simulation)
            return this.customizePowerPoint(resource, userData);
        } else if (resource.type === 'email') {
            // Merge tags
            return this.mergeEmailTemplate(resource, userData);
        }
        
        return resource.url;
    }
    
    // Personnaliser PowerPoint
    customizePowerPoint(resource, userData) {
        console.log('🎨 Personnalisation PowerPoint:', resource.title);
        // Simulation: injecter données utilisateur
        const customUrl = `${resource.url}?custom=${encodeURIComponent(JSON.stringify(userData))}`;
        return customUrl;
    }
    
    // Fusionner template email
    mergeEmailTemplate(resource, userData) {
        console.log('✉️ Fusion template email:', resource.title);
        // Remplacer les variables
        let template = resource.content || '';
        Object.entries(userData).forEach(([key, value]) => {
            template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return template;
    }
    
    // Sauvegarder ressources
    saveResources() {
        localStorage.setItem('marketing_resources', JSON.stringify(this.resources));
    }
}

// Calcul commissions
class CommissionCalculator {
    constructor() {
        this.rules = {
            licenses: {
                base: 0.10,
                tiers: [
                    { min: 0, max: 50000, rate: 0.10 },
                    { min: 50001, max: 100000, rate: 0.11 },
                    { min: 100001, max: Infinity, rate: 0.12 }
                ]
            },
            services: { base: 0.08 },
            support: { base: 0.05 },
            training: { base: 0.15 },
            bonuses: {
                volume: { threshold: 250000, bonus: 0.02 },
                newClients: { threshold: 10, bonus: 1000 },
                retention: { threshold: 0.95, bonus: 0.01 }
            }
        };
        this.yearlyVolume = 0;
        this.loadYearlyData();
    }
    
    // Charger données annuelles
    loadYearlyData() {
        const sales = JSON.parse(localStorage.getItem('sales_data') || '[]');
        const currentYear = new Date().getFullYear();
        
        this.yearlyVolume = sales
            .filter(s => new Date(s.date).getFullYear() === currentYear)
            .reduce((sum, s) => sum + s.amount, 0);
    }
    
    // Obtenir le taux selon le montant
    getRate(type, amount) {
        if (type === 'licenses' && this.rules.licenses.tiers) {
            const tier = this.rules.licenses.tiers.find(
                t => amount >= t.min && amount <= t.max
            );
            return tier ? tier.rate : this.rules.licenses.base;
        }
        
        return this.rules[type]?.base || 0.10;
    }
    
    // Calculer commission
    calculateCommission(sale) {
        let commission = 0;
        let rate = this.getRate(sale.type, sale.amount);
        
        // Commission de base
        commission = sale.amount * rate;
        
        // Bonus volume
        if (this.yearlyVolume >= this.rules.bonuses.volume.threshold) {
            commission += sale.amount * this.rules.bonuses.volume.bonus;
        }
        
        // Prime nouveau client
        if (sale.isNewClient && sale.type === 'licenses') {
            commission += this.rules.bonuses.newClients.bonus;
        }
        
        return {
            base: sale.amount * rate,
            bonuses: commission - (sale.amount * rate),
            total: commission,
            rate: rate,
            details: this.getCalculationDetails(sale)
        };
    }
    
    // Détails du calcul
    getCalculationDetails(sale) {
        const details = [];
        const rate = this.getRate(sale.type, sale.amount);
        
        details.push({
            label: 'Commission de base',
            calculation: `${sale.amount} × ${(rate * 100).toFixed(0)}%`,
            amount: sale.amount * rate
        });
        
        if (this.yearlyVolume >= this.rules.bonuses.volume.threshold) {
            details.push({
                label: 'Bonus volume',
                calculation: `${sale.amount} × 2%`,
                amount: sale.amount * 0.02
            });
        }
        
        if (sale.isNewClient && sale.type === 'licenses') {
            details.push({
                label: 'Prime nouveau client',
                calculation: 'Forfait',
                amount: 1000
            });
        }
        
        return details;
    }
    
    // Projection mensuelle
    projectMonthlyCommission(currentSales, daysElapsed, daysInMonth) {
        const dailyAverage = currentSales / daysElapsed;
        const projection = dailyAverage * daysInMonth;
        
        return {
            current: this.calculateCommission({ amount: currentSales, type: 'mixed' }),
            projected: this.calculateCommission({ amount: projection, type: 'mixed' }),
            confidence: this.calculateConfidence(daysElapsed, daysInMonth)
        };
    }
    
    // Calculer niveau de confiance
    calculateConfidence(daysElapsed, daysInMonth) {
        const percentElapsed = daysElapsed / daysInMonth;
        
        if (percentElapsed < 0.25) return 'Faible';
        if (percentElapsed < 0.5) return 'Moyen';
        if (percentElapsed < 0.75) return 'Bon';
        return 'Excellent';
    }
}

// Générateur de rapports
class ReportGenerator {
    constructor() {
        this.templates = {
            'monthly-sales': {
                name: 'Rapport Mensuel Ventes',
                template: 'monthly-sales-template.xlsx',
                defaultFormat: 'pdf',
                sections: ['summary', 'details', 'charts', 'recommendations']
            },
            'quarterly-analysis': {
                name: 'Analyse Trimestrielle',
                template: 'quarterly-analysis-template.pptx',
                defaultFormat: 'pptx',
                sections: ['overview', 'trends', 'comparison', 'forecast']
            },
            'commercial-book': {
                name: 'Book Commercial',
                template: 'commercial-book-template.pdf',
                defaultFormat: 'pdf',
                sections: ['portfolio', 'cases', 'references']
            },
            'geographic': {
                name: 'Rapport Géographique',
                template: 'geo-report-template.pdf',
                defaultFormat: 'pdf',
                sections: ['map', 'zones', 'potential', 'competition']
            }
        };
        this.scheduledReports = this.loadScheduledReports();
    }
    
    // Charger rapports programmés
    loadScheduledReports() {
        return JSON.parse(localStorage.getItem('scheduled_reports') || '[]');
    }
    
    // Générer rapport
    async generateReport(type, params) {
        console.log(`📊 Génération rapport ${type}...`);
        
        try {
            // Collecte données
            const data = await this.collectReportData(type, params);
            
            // Application template
            const report = await this.applyTemplate(type, data);
            
            // Personnalisation
            const customized = await this.customizeReport(report, params);
            
            // Export
            const url = await this.exportReport(customized, params.format);
            
            // Notification succès
            this.showNotification('Rapport généré avec succès!', 'success');
            
            // Téléchargement
            this.downloadReport(url, `${type}_${params.period}.${params.format}`);
            
            // Analytics
            this.trackReportGeneration(type, params);
            
            return url;
            
        } catch (error) {
            this.showNotification('Erreur lors de la génération', 'error');
            console.error('Erreur génération rapport:', error);
            throw error;
        }
    }
    
    // Collecter données pour le rapport
    async collectReportData(type, params) {
        console.log('📥 Collecte des données...');
        
        // Simulation collecte données
        const data = {
            period: params.period,
            generatedAt: new Date(),
            user: JSON.parse(localStorage.getItem('currentUser') || '{}'),
            metrics: {}
        };
        
        // Selon le type de rapport
        switch(type) {
            case 'monthly-sales':
                data.metrics = {
                    revenue: 245000,
                    sales: 47,
                    newClients: 8,
                    topProducts: ['Licence Enterprise', 'Service Pro'],
                    pipeline: 890000
                };
                break;
                
            case 'quarterly-analysis':
                data.metrics = {
                    growthRate: 18.5,
                    marketShare: 12.3,
                    trends: ['Cloud adoption', 'AI integration'],
                    forecast: { q2: 780000, q3: 920000 }
                };
                break;
                
            default:
                data.metrics = { generic: true };
        }
        
        return data;
    }
    
    // Appliquer template
    async applyTemplate(type, data) {
        console.log('📄 Application du template...');
        
        const template = this.templates[type];
        if (!template) {
            throw new Error(`Template inconnu: ${type}`);
        }
        
        // Simulation application template
        return {
            ...template,
            data: data,
            generated: true
        };
    }
    
    // Personnaliser rapport
    async customizeReport(report, params) {
        console.log('🎨 Personnalisation du rapport...');
        
        // Ajouter personnalisations selon params
        if (params.includeCharts) {
            report.charts = true;
        }
        
        if (params.compareLastPeriod) {
            report.comparison = true;
        }
        
        return report;
    }
    
    // Exporter rapport
    async exportReport(report, format) {
        console.log(`💾 Export au format ${format}...`);
        
        // Simulation export
        const blob = new Blob([JSON.stringify(report)], {
            type: this.getMimeType(format)
        });
        
        return URL.createObjectURL(blob);
    }
    
    // Obtenir MIME type
    getMimeType(format) {
        const types = {
            pdf: 'application/pdf',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            csv: 'text/csv'
        };
        return types[format] || 'application/octet-stream';
    }
    
    // Télécharger rapport
    downloadReport(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    // Programmer rapport
    scheduleReport(config) {
        const schedule = {
            id: Date.now(),
            ...config,
            nextRun: this.calculateNextRun(config.frequency),
            status: 'active'
        };
        
        this.scheduledReports.push(schedule);
        this.saveScheduledReports();
        
        this.showNotification(`Rapport programmé: ${config.name}`, 'success');
        return schedule;
    }
    
    // Calculer prochaine exécution
    calculateNextRun(frequency) {
        const now = new Date();
        
        switch(frequency) {
            case 'daily':
                return new Date(now.setDate(now.getDate() + 1));
            case 'weekly':
                return new Date(now.setDate(now.getDate() + 7));
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1));
            case 'quarterly':
                return new Date(now.setMonth(now.getMonth() + 3));
            default:
                return null;
        }
    }
    
    // Sauvegarder rapports programmés
    saveScheduledReports() {
        localStorage.setItem('scheduled_reports', JSON.stringify(this.scheduledReports));
    }
    
    // Tracking génération
    trackReportGeneration(type, params) {
        const event = {
            type: 'report_generated',
            report: type,
            format: params.format,
            timestamp: new Date()
        };
        
        // Enregistrer dans historique
        const history = JSON.parse(localStorage.getItem('report_history') || '[]');
        history.push(event);
        localStorage.setItem('report_history', JSON.stringify(history));
    }
    
    // Afficher notification
    showNotification(message, type) {
        if (typeof PortalApp !== 'undefined' && PortalApp.showToast) {
            PortalApp.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Gestionnaire de campagnes
class CampaignManager {
    constructor() {
        this.campaigns = this.loadCampaigns();
    }
    
    // Charger campagnes
    loadCampaigns() {
        return [
            {
                id: 'promo-q1',
                name: 'Promo Q1 2024',
                type: 'discount',
                discount: 20,
                products: ['licenses'],
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-03-31'),
                status: 'active'
            },
            {
                id: 'webinar-mars',
                name: 'Webinar mensuel',
                type: 'event',
                date: new Date('2024-03-28'),
                registrations: 48,
                status: 'active'
            },
            {
                id: 'tech-lausanne',
                name: 'Salon Tech Lausanne',
                type: 'event',
                dates: {
                    start: new Date('2024-03-15'),
                    end: new Date('2024-03-17')
                },
                booth: 'B-42',
                status: 'active'
            }
        ];
    }
    
    // Obtenir lien tracking
    getTrackingLink(campaignId, userId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) return null;
        
        const params = {
            cid: campaignId,
            uid: userId,
            source: 'portal',
            medium: 'referral'
        };
        
        return `https://portal.company.ch/c/${campaignId}?${new URLSearchParams(params)}`;
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Marketing Tools chargé');
});