/**
 * Pipeline & CRM Management System
 * Gestion complète du pipeline commercial et CRM
 */

// Système Pipeline Kanban
class PipelineManager {
    constructor() {
        this.deals = this.loadDeals();
        this.stages = [
            { id: 'prospect', name: 'Prospect', color: '#94a3b8' },
            { id: 'qualification', name: 'Qualification', color: '#60a5fa' },
            { id: 'proposition', name: 'Proposition', color: '#fbbf24' },
            { id: 'negotiation', name: 'Négociation', color: '#fb923c' },
            { id: 'closed', name: 'Fermé', color: '#10b981' }
        ];
        this.initKanban();
        this.updatePipelineMetrics();
    }
    
    // Charger les deals (simulation)
    loadDeals() {
        const savedDeals = localStorage.getItem('pipeline_deals');
        if (savedDeals) {
            return JSON.parse(savedDeals);
        }
        
        // Données d'exemple
        return [
            {
                id: 1,
                company: 'TechCorp SA',
                contact: 'Marie Dubois',
                phone: '079 123 45 67',
                value: 45000,
                stage: 'prospect',
                product: 'Licence Enterprise',
                probability: 20,
                daysInStage: 3,
                tags: ['urgent'],
                assignedTo: 'Jean Dupont'
            },
            {
                id: 2,
                company: 'StartupFood',
                contact: 'Jean Martin',
                phone: '078 987 65 43',
                value: 28000,
                stage: 'prospect',
                product: 'Service Pro',
                probability: 10,
                daysInStage: 7,
                tags: [],
                assignedTo: 'Jean Dupont'
            }
        ];
    }
    
    // Initialiser Kanban avec Sortable.js
    initKanban() {
        if (typeof Sortable === 'undefined') {
            console.warn('Sortable.js non chargé');
            return;
        }
        
        this.stages.forEach(stage => {
            const container = document.getElementById(`stage-${stage.id}`);
            if (container) {
                new Sortable(container, {
                    group: 'deals',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    dragClass: 'sortable-drag',
                    onEnd: (evt) => this.onDealMoved(evt)
                });
            }
        });
    }
    
    // Gérer le déplacement d'un deal
    onDealMoved(evt) {
        const dealId = parseInt(evt.item.dataset.dealId);
        const fromStage = evt.from.dataset.stage;
        const toStage = evt.to.dataset.stage;
        
        // Confirmation si rétrogradation
        if (this.isDowngrade(fromStage, toStage)) {
            if (!confirm('Êtes-vous sûr de vouloir rétrograder ce deal ?')) {
                evt.from.appendChild(evt.item);
                return;
            }
        }
        
        // Update deal
        this.updateDealStage(dealId, toStage);
        this.updatePipelineMetrics();
        
        // Animation
        evt.item.classList.add('deal-moved');
        setTimeout(() => {
            evt.item.classList.remove('deal-moved');
        }, 600);
        
        // Notification
        PortalApp.showToast(`Deal déplacé vers ${this.getStageLabel(toStage)}`, 'success');
    }
    
    // Vérifier si c'est une rétrogradation
    isDowngrade(fromStage, toStage) {
        const fromIndex = this.stages.findIndex(s => s.id === fromStage);
        const toIndex = this.stages.findIndex(s => s.id === toStage);
        return toIndex < fromIndex;
    }
    
    // Mettre à jour l'étape d'un deal
    updateDealStage(dealId, newStage) {
        const deal = this.deals.find(d => d.id === dealId);
        if (deal) {
            deal.stage = newStage;
            deal.daysInStage = 0;
            
            // Ajuster la probabilité selon l'étape
            const probabilities = {
                prospect: 10,
                qualification: 30,
                proposition: 50,
                negotiation: 75,
                closed: 100
            };
            deal.probability = probabilities[newStage] || deal.probability;
            
            // Sauvegarder
            this.saveDeals();
        }
    }
    
    // Obtenir le label d'une étape
    getStageLabel(stageId) {
        const stage = this.stages.find(s => s.id === stageId);
        return stage ? stage.name : stageId;
    }
    
    // Calculer le score d'un deal
    calculateDealScore(deal) {
        let score = 0;
        
        // Critères de scoring
        if (deal.value > 50000) score += 30;
        else if (deal.value > 20000) score += 20;
        else if (deal.value > 10000) score += 10;
        
        if (deal.decisionMaker) score += 20;
        if (deal.budgetConfirmed) score += 25;
        if (deal.timeline === 'immediate') score += 25;
        else if (deal.timeline === '3months') score += 15;
        
        if (deal.companySize === 'enterprise') score += 15;
        if (deal.products && deal.products.length > 1) score += 10;
        
        return Math.min(100, score);
    }
    
    // Mettre à jour les métriques du pipeline
    updatePipelineMetrics() {
        const metrics = {
            total: 0,
            byStage: {},
            conversion: {}
        };
        
        this.stages.forEach(stage => {
            const stageDeals = this.deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            
            metrics.byStage[stage.id] = {
                count: stageDeals.length,
                value: stageValue
            };
            
            metrics.total += stageValue;
        });
        
        // Calculer les taux de conversion
        for (let i = 1; i < this.stages.length; i++) {
            const prevStage = this.stages[i - 1].id;
            const currStage = this.stages[i].id;
            const prevCount = metrics.byStage[prevStage].count || 1;
            const currCount = metrics.byStage[currStage].count;
            
            metrics.conversion[currStage] = Math.round((currCount / prevCount) * 100);
        }
        
        this.displayMetrics(metrics);
    }
    
    // Afficher les métriques
    displayMetrics(metrics) {
        console.log('Pipeline metrics:', metrics);
        // Mettre à jour l'UI avec les métriques
    }
    
    // Sauvegarder les deals
    saveDeals() {
        localStorage.setItem('pipeline_deals', JSON.stringify(this.deals));
    }
}

// Lead Scoring Engine
class LeadScoring {
    constructor() {
        this.weights = {
            budgetSize: 0.3,
            timeline: 0.25,
            engagement: 0.2,
            fit: 0.15,
            source: 0.1
        };
    }
    
    // Calculer le score d'un lead
    calculateScore(lead) {
        const scores = {
            budgetSize: this.scoreBudget(lead.estimatedBudget),
            timeline: this.scoreTimeline(lead.timeline),
            engagement: this.scoreEngagement(lead.interactions),
            fit: this.scoreFit(lead.companySize, lead.industry),
            source: this.scoreSource(lead.source)
        };
        
        // Calcul pondéré
        let totalScore = 0;
        for (const [factor, weight] of Object.entries(this.weights)) {
            totalScore += scores[factor] * weight;
        }
        
        return {
            total: Math.round(totalScore),
            breakdown: scores,
            temperature: this.getTemperature(totalScore)
        };
    }
    
    // Score du budget
    scoreBudget(budget) {
        if (!budget) return 0;
        if (budget >= 100000) return 100;
        if (budget >= 50000) return 80;
        if (budget >= 25000) return 60;
        if (budget >= 10000) return 40;
        return 20;
    }
    
    // Score du timing
    scoreTimeline(timeline) {
        const scores = {
            'immediate': 100,
            '<3months': 80,
            '3-6months': 60,
            '6-12months': 40,
            '>1year': 20
        };
        return scores[timeline] || 0;
    }
    
    // Score de l'engagement
    scoreEngagement(interactions) {
        if (!interactions) return 0;
        const score = Math.min(100, interactions.length * 10);
        return score;
    }
    
    // Score du fit
    scoreFit(companySize, industry) {
        let score = 50; // Base
        
        // Bonus taille entreprise
        if (companySize === 'enterprise') score += 30;
        else if (companySize === 'midmarket') score += 20;
        else if (companySize === 'smb') score += 10;
        
        // Bonus industrie (exemples)
        const goodIndustries = ['technology', 'finance', 'healthcare'];
        if (goodIndustries.includes(industry)) score += 20;
        
        return Math.min(100, score);
    }
    
    // Score de la source
    scoreSource(source) {
        const scores = {
            'referral': 100,
            'website': 80,
            'event': 70,
            'outbound': 50,
            'coldcall': 30
        };
        return scores[source] || 50;
    }
    
    // Obtenir la température du lead
    getTemperature(score) {
        if (score >= 70) return { label: 'Chaud', emoji: '🔥', color: '#ef4444' };
        if (score >= 40) return { label: 'Tiède', emoji: '🌡️', color: '#f59e0b' };
        return { label: 'Froid', emoji: '❄️', color: '#3b82f6' };
    }
}

// Client Health Score
function calculateClientHealth(client) {
    const factors = {
        nps: client.npsScore || 0,
        usage: client.productUsage || 0,
        support: Math.max(0, 100 - (client.supportTickets || 0) * 5),
        payment: client.paymentOnTime ? 100 : 50,
        engagement: client.lastContact < 30 ? 100 : 50,
        renewal: client.daysUntilRenewal > 90 ? 100 : 50
    };
    
    // Moyenne pondérée
    const weights = {
        nps: 0.25,
        usage: 0.25,
        support: 0.15,
        payment: 0.15,
        engagement: 0.1,
        renewal: 0.1
    };
    
    let health = 0;
    for (const [factor, value] of Object.entries(factors)) {
        health += value * (weights[factor] || 0.1);
    }
    
    if (health >= 80) return { status: 'Excellent', color: 'success', icon: '🟢' };
    if (health >= 60) return { status: 'À surveiller', color: 'warning', icon: '🟡' };
    return { status: 'À risque', color: 'danger', icon: '🔴' };
}

// Prévisions de ventes
class SalesForecast {
    constructor(deals) {
        this.deals = deals;
    }
    
    // Calculer les prévisions
    calculate(period = 'quarter') {
        const forecast = {
            weighted: 0,
            bestCase: 0,
            worstCase: 0,
            expected: 0
        };
        
        this.deals.forEach(deal => {
            if (deal.stage !== 'closed') {
                // Valeur pondérée par probabilité
                forecast.weighted += deal.value * (deal.probability / 100);
                
                // Meilleur cas : tous les deals se ferment
                forecast.bestCase += deal.value;
                
                // Pire cas : seulement les deals > 75% de probabilité
                if (deal.probability > 75) {
                    forecast.worstCase += deal.value;
                }
            }
        });
        
        // Cas attendu : moyenne entre pondéré et meilleur cas
        forecast.expected = (forecast.weighted + forecast.bestCase) / 2;
        
        return forecast;
    }
}

// Import/Export fonctionnalités
class CRMDataManager {
    // Exporter les données en CSV
    exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Convertir en CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Échapper les valeurs contenant des virgules
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }
    
    // Importer depuis CSV
    importFromCSV(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const csv = e.target.result;
            const data = this.parseCSV(csv);
            callback(data);
        };
        
        reader.readAsText(file);
    }
    
    // Parser CSV
    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index]?.trim() || '';
                });
                
                data.push(row);
            }
        }
        
        return data;
    }
}

// Gestionnaire d'activités CRM
class ActivityManager {
    constructor() {
        this.activities = [];
    }
    
    // Ajouter une activité
    addActivity(type, data) {
        const activity = {
            id: Date.now(),
            type: type, // call, email, meeting, note
            timestamp: new Date(),
            ...data
        };
        
        this.activities.push(activity);
        this.saveActivities();
        
        return activity;
    }
    
    // Obtenir les activités d'un client
    getClientActivities(clientId) {
        return this.activities
            .filter(a => a.clientId === clientId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Sauvegarder les activités
    saveActivities() {
        localStorage.setItem('crm_activities', JSON.stringify(this.activities));
    }
    
    // Charger les activités
    loadActivities() {
        const saved = localStorage.getItem('crm_activities');
        if (saved) {
            this.activities = JSON.parse(saved).map(a => ({
                ...a,
                timestamp: new Date(a.timestamp)
            }));
        }
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Pipeline CRM chargé');
});