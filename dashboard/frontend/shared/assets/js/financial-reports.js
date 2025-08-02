/**
 * Financial Reports Module
 * Monthly reporting with multi-entity consolidation
 * 
 * This module handles:
 * - Multi-entity financial data aggregation
 * - KPI calculations and ratios
 * - Cash flow analysis
 * - Trend analysis and projections
 * - Report generation and export
 */

const FinancialReports = (function() {
    'use strict';

    // Entity definitions
    const ENTITIES = {
        'hypervisual': {
            name: 'Hypervisual SA',
            type: 'services',
            vatNumber: 'CHE-123.456.789',
            currency: 'CHF',
            consolidation: 'full'
        },
        'dainamics': {
            name: 'Dainamics Labs',
            type: 'technology',
            vatNumber: 'CHE-987.654.321',
            currency: 'CHF',
            consolidation: 'full'
        },
        'enki': {
            name: 'Enki Robotics',
            type: 'technology',
            vatNumber: 'CHE-456.789.123',
            currency: 'CHF',
            consolidation: 'full'
        },
        'takeout': {
            name: 'Takeout Shops',
            type: 'retail',
            vatNumber: 'CHE-789.123.456',
            currency: 'CHF',
            consolidation: 'full'
        },
        'lexaia': {
            name: 'Lexaia Ventures',
            type: 'investment',
            vatNumber: 'CHE-321.654.987',
            currency: 'CHF',
            consolidation: 'equity'
        }
    };

    // KPI definitions
    const KPI_DEFINITIONS = {
        grossMargin: {
            name: 'Marge brute',
            formula: '(Revenue - COGS) / Revenue',
            format: 'percentage',
            target: 0.45,
            category: 'profitability'
        },
        ebitdaMargin: {
            name: 'Marge EBITDA',
            formula: 'EBITDA / Revenue',
            format: 'percentage',
            target: 0.20,
            category: 'profitability'
        },
        netMargin: {
            name: 'Marge nette',
            formula: 'Net Income / Revenue',
            format: 'percentage',
            target: 0.10,
            category: 'profitability'
        },
        roe: {
            name: 'Return on Equity',
            formula: 'Net Income / Equity',
            format: 'percentage',
            target: 0.15,
            category: 'efficiency'
        },
        roa: {
            name: 'Return on Assets',
            formula: 'Net Income / Total Assets',
            format: 'percentage',
            target: 0.08,
            category: 'efficiency'
        },
        currentRatio: {
            name: 'Ratio de liquidité',
            formula: 'Current Assets / Current Liabilities',
            format: 'ratio',
            target: 1.5,
            category: 'liquidity'
        },
        quickRatio: {
            name: 'Quick Ratio',
            formula: '(Current Assets - Inventory) / Current Liabilities',
            format: 'ratio',
            target: 1.0,
            category: 'liquidity'
        },
        debtToEquity: {
            name: 'Debt to Equity',
            formula: 'Total Debt / Equity',
            format: 'ratio',
            target: 0.5,
            category: 'solvency'
        },
        dso: {
            name: 'Days Sales Outstanding',
            formula: '(Receivables / Revenue) * Days',
            format: 'days',
            target: 30,
            category: 'efficiency'
        },
        dpo: {
            name: 'Days Payables Outstanding',
            formula: '(Payables / COGS) * Days',
            format: 'days',
            target: 45,
            category: 'efficiency'
        }
    };

    // Current period data
    let currentPeriod = {
        year: 2025,
        month: 1,
        entities: {}
    };

    // Historical data for trends
    let historicalData = [];

    /**
     * Format amount in Swiss format
     */
    function formatSwissAmount(amount) {
        const parts = Math.abs(amount).toFixed(0).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        return (amount < 0 ? '-' : '') + parts.join('.');
    }

    /**
     * Format percentage
     */
    function formatPercentage(value, decimals = 1) {
        return (value * 100).toFixed(decimals) + '%';
    }

    /**
     * Format variance
     */
    function formatVariance(current, previous) {
        if (!previous || previous === 0) return 'N/A';
        const variance = ((current - previous) / Math.abs(previous)) * 100;
        const formatted = variance.toFixed(1) + '%';
        return variance > 0 ? '+' + formatted : formatted;
    }

    /**
     * Calculate working capital requirement (BFR)
     */
    function calculateBFR(data) {
        return {
            receivables: data.receivables || 0,
            inventory: data.inventory || 0,
            payables: data.payables || 0,
            total: (data.receivables || 0) + (data.inventory || 0) - (data.payables || 0)
        };
    }

    /**
     * Generate entity financial data
     */
    function generateEntityData(entityId, period) {
        // In real implementation, this would fetch from accounting system
        // For demo, we generate realistic data based on entity type
        
        const entity = ENTITIES[entityId];
        const baseData = getBaseDataForEntity(entityId, period);
        
        // Calculate all financial metrics
        const financials = {
            entity: entity,
            period: period,
            
            // Income statement
            revenue: baseData.revenue,
            cogs: baseData.cogs,
            grossProfit: baseData.revenue - baseData.cogs,
            opex: baseData.opex,
            ebitda: baseData.revenue - baseData.cogs - baseData.opex + baseData.depreciation,
            depreciation: baseData.depreciation,
            ebit: baseData.revenue - baseData.cogs - baseData.opex,
            interest: baseData.interest,
            ebt: baseData.revenue - baseData.cogs - baseData.opex - baseData.interest,
            tax: (baseData.revenue - baseData.cogs - baseData.opex - baseData.interest) * 0.15,
            netIncome: (baseData.revenue - baseData.cogs - baseData.opex - baseData.interest) * 0.85,
            
            // Balance sheet
            currentAssets: baseData.currentAssets,
            fixedAssets: baseData.fixedAssets,
            totalAssets: baseData.currentAssets + baseData.fixedAssets,
            currentLiabilities: baseData.currentLiabilities,
            longTermDebt: baseData.longTermDebt,
            totalLiabilities: baseData.currentLiabilities + baseData.longTermDebt,
            equity: baseData.equity,
            
            // Working capital details
            receivables: baseData.receivables,
            inventory: baseData.inventory,
            payables: baseData.payables,
            
            // Cash flow
            operatingCashFlow: baseData.operatingCashFlow,
            investingCashFlow: baseData.investingCashFlow,
            financingCashFlow: baseData.financingCashFlow,
            freeCashFlow: baseData.operatingCashFlow + baseData.investingCashFlow
        };
        
        // Calculate KPIs
        financials.kpis = calculateKPIs(financials);
        
        return financials;
    }

    /**
     * Get base data for entity (demo data)
     */
    function getBaseDataForEntity(entityId, period) {
        // Generate consistent but varied data for each entity
        const multipliers = {
            hypervisual: { size: 1.0, margin: 0.45, growth: 0.12 },
            dainamics: { size: 0.8, margin: 0.50, growth: 0.25 },
            enki: { size: 0.6, margin: 0.40, growth: 0.35 },
            takeout: { size: 1.2, margin: 0.25, growth: 0.08 },
            lexaia: { size: 0.3, margin: 0.60, growth: 0.15 }
        };
        
        const mult = multipliers[entityId];
        const monthFactor = 1 + (period.month - 1) * 0.02; // Slight monthly growth
        
        const revenue = 500000 * mult.size * monthFactor;
        const cogs = revenue * (1 - mult.margin);
        
        return {
            revenue: revenue,
            cogs: cogs,
            opex: revenue * 0.25,
            depreciation: revenue * 0.02,
            interest: revenue * 0.01,
            
            currentAssets: revenue * 2.5,
            fixedAssets: revenue * 1.5,
            currentLiabilities: revenue * 1.2,
            longTermDebt: revenue * 0.5,
            equity: revenue * 2.3,
            
            receivables: revenue * 0.75,
            inventory: cogs * 0.5,
            payables: cogs * 0.6,
            
            operatingCashFlow: revenue * 0.18,
            investingCashFlow: -revenue * 0.05,
            financingCashFlow: -revenue * 0.08
        };
    }

    /**
     * Calculate KPIs from financial data
     */
    function calculateKPIs(data) {
        const kpis = {};
        
        // Profitability KPIs
        kpis.grossMargin = data.grossProfit / data.revenue;
        kpis.ebitdaMargin = data.ebitda / data.revenue;
        kpis.netMargin = data.netIncome / data.revenue;
        
        // Efficiency KPIs
        kpis.roe = data.netIncome / data.equity;
        kpis.roa = data.netIncome / data.totalAssets;
        kpis.assetTurnover = data.revenue / data.totalAssets;
        
        // Liquidity KPIs
        kpis.currentRatio = data.currentAssets / data.currentLiabilities;
        kpis.quickRatio = (data.currentAssets - data.inventory) / data.currentLiabilities;
        kpis.cashRatio = (data.currentAssets - data.inventory - data.receivables) / data.currentLiabilities;
        
        // Solvency KPIs
        kpis.debtToEquity = data.totalLiabilities / data.equity;
        kpis.debtToAssets = data.totalLiabilities / data.totalAssets;
        kpis.interestCoverage = data.ebit / data.interest;
        
        // Working capital KPIs
        const daysInPeriod = 30;
        kpis.dso = (data.receivables / data.revenue) * daysInPeriod;
        kpis.dio = (data.inventory / data.cogs) * daysInPeriod;
        kpis.dpo = (data.payables / data.cogs) * daysInPeriod;
        kpis.cashConversionCycle = kpis.dso + kpis.dio - kpis.dpo;
        
        return kpis;
    }

    /**
     * Consolidate multi-entity data
     */
    function consolidateEntities(entityData) {
        const consolidated = {
            revenue: 0,
            cogs: 0,
            grossProfit: 0,
            opex: 0,
            ebitda: 0,
            depreciation: 0,
            ebit: 0,
            interest: 0,
            tax: 0,
            netIncome: 0,
            
            currentAssets: 0,
            fixedAssets: 0,
            totalAssets: 0,
            currentLiabilities: 0,
            longTermDebt: 0,
            totalLiabilities: 0,
            equity: 0,
            
            receivables: 0,
            inventory: 0,
            payables: 0,
            
            operatingCashFlow: 0,
            investingCashFlow: 0,
            financingCashFlow: 0,
            freeCashFlow: 0
        };
        
        // Sum all entities (simplified - real consolidation would handle intercompany eliminations)
        Object.values(entityData).forEach(data => {
            Object.keys(consolidated).forEach(key => {
                if (typeof data[key] === 'number') {
                    consolidated[key] += data[key];
                }
            });
        });
        
        // Recalculate derived values
        consolidated.grossProfit = consolidated.revenue - consolidated.cogs;
        consolidated.ebit = consolidated.grossProfit - consolidated.opex;
        consolidated.totalAssets = consolidated.currentAssets + consolidated.fixedAssets;
        consolidated.totalLiabilities = consolidated.currentLiabilities + consolidated.longTermDebt;
        consolidated.freeCashFlow = consolidated.operatingCashFlow + consolidated.investingCashFlow;
        
        // Calculate consolidated KPIs
        consolidated.kpis = calculateKPIs(consolidated);
        
        return consolidated;
    }

    /**
     * Generate trend data
     */
    function generateTrendData(months = 12) {
        const trends = [];
        const currentDate = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const periodData = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                entities: {}
            };
            
            // Generate data for each entity
            Object.keys(ENTITIES).forEach(entityId => {
                periodData.entities[entityId] = generateEntityData(entityId, {
                    year: periodData.year,
                    month: periodData.month
                });
            });
            
            // Add consolidated data
            periodData.consolidated = consolidateEntities(periodData.entities);
            
            trends.push(periodData);
        }
        
        return trends;
    }

    /**
     * Calculate growth rates
     */
    function calculateGrowthRates(current, previous) {
        const growth = {};
        
        ['revenue', 'grossProfit', 'ebitda', 'netIncome'].forEach(metric => {
            if (previous && previous[metric]) {
                growth[metric] = (current[metric] - previous[metric]) / previous[metric];
            } else {
                growth[metric] = 0;
            }
        });
        
        return growth;
    }

    /**
     * Generate waterfall chart data
     */
    function generateWaterfallData(data) {
        return [
            { name: 'Chiffre d\'affaires', value: data.revenue, type: 'positive' },
            { name: 'Coût des ventes', value: -data.cogs, type: 'negative' },
            { name: 'Marge brute', value: data.grossProfit, type: 'subtotal' },
            { name: 'Charges opérationnelles', value: -data.opex, type: 'negative' },
            { name: 'EBITDA', value: data.ebitda, type: 'subtotal' },
            { name: 'Amortissements', value: -data.depreciation, type: 'negative' },
            { name: 'Charges financières', value: -data.interest, type: 'negative' },
            { name: 'Impôts', value: -data.tax, type: 'negative' },
            { name: 'Résultat net', value: data.netIncome, type: 'total' }
        ];
    }

    /**
     * Generate cash flow waterfall data
     */
    function generateCashFlowWaterfall(data, bfr) {
        return [
            { name: 'EBITDA', value: data.ebitda, type: 'positive' },
            { name: 'Variation clients', value: -bfr.receivables * 0.1, type: 'negative' },
            { name: 'Variation stocks', value: -bfr.inventory * 0.05, type: 'negative' },
            { name: 'Variation fournisseurs', value: bfr.payables * 0.1, type: 'positive' },
            { name: 'Cash-flow opérationnel', value: data.operatingCashFlow, type: 'subtotal' },
            { name: 'Investissements', value: data.investingCashFlow, type: 'negative' },
            { name: 'Free Cash-Flow', value: data.freeCashFlow, type: 'subtotal' },
            { name: 'Financement', value: data.financingCashFlow, type: 'negative' },
            { name: 'Variation nette', value: data.operatingCashFlow + data.investingCashFlow + data.financingCashFlow, type: 'total' }
        ];
    }

    /**
     * Export report to Excel format
     */
    function exportToExcel(reportData) {
        // In real implementation, this would use a library like SheetJS
        // For now, we'll create a CSV format
        
        const csv = [];
        
        // Headers
        csv.push(['Rapport Financier Mensuel', `${reportData.period.month}/${reportData.period.year}`]);
        csv.push([]);
        
        // Consolidated summary
        csv.push(['SYNTHÈSE CONSOLIDÉE']);
        csv.push(['Chiffre d\'affaires', formatSwissAmount(reportData.consolidated.revenue)]);
        csv.push(['Marge brute', formatSwissAmount(reportData.consolidated.grossProfit), formatPercentage(reportData.consolidated.kpis.grossMargin)]);
        csv.push(['EBITDA', formatSwissAmount(reportData.consolidated.ebitda), formatPercentage(reportData.consolidated.kpis.ebitdaMargin)]);
        csv.push(['Résultat net', formatSwissAmount(reportData.consolidated.netIncome), formatPercentage(reportData.consolidated.kpis.netMargin)]);
        csv.push([]);
        
        // Entity details
        csv.push(['DÉTAIL PAR ENTITÉ']);
        Object.entries(reportData.entities).forEach(([entityId, data]) => {
            csv.push([data.entity.name]);
            csv.push(['  Chiffre d\'affaires', formatSwissAmount(data.revenue)]);
            csv.push(['  Résultat net', formatSwissAmount(data.netIncome)]);
            csv.push([]);
        });
        
        // Convert to CSV string
        const csvContent = csv.map(row => row.join(',')).join('\n');
        
        // Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport_financier_${reportData.period.year}_${reportData.period.month}.csv`;
        link.click();
    }

    /**
     * Generate PDF report
     */
    function exportToPDF(reportData) {
        // In real implementation, this would use a library like jsPDF
        console.log('PDF export would be implemented here', reportData);
        alert('Export PDF sera disponible prochainement');
    }

    /**
     * Generate PowerPoint presentation
     */
    function exportToPowerPoint(reportData) {
        // In real implementation, this would use a library like PptxGenJS
        console.log('PowerPoint export would be implemented here', reportData);
        alert('Export PowerPoint sera disponible prochainement');
    }

    /**
     * Initialize current period data
     */
    function initializeCurrentPeriod() {
        const now = new Date();
        currentPeriod = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            entities: {}
        };
        
        // Generate data for each entity
        Object.keys(ENTITIES).forEach(entityId => {
            currentPeriod.entities[entityId] = generateEntityData(entityId, currentPeriod);
        });
        
        // Generate consolidated data
        currentPeriod.consolidated = consolidateEntities(currentPeriod.entities);
        
        // Generate historical data
        historicalData = generateTrendData(12);
    }

    /**
     * Get report data for UI
     */
    function getReportData() {
        const previousPeriod = historicalData[historicalData.length - 2];
        
        return {
            period: currentPeriod,
            entities: currentPeriod.entities,
            consolidated: currentPeriod.consolidated,
            growth: previousPeriod ? calculateGrowthRates(currentPeriod.consolidated, previousPeriod.consolidated) : {},
            trends: historicalData,
            waterfallData: generateWaterfallData(currentPeriod.consolidated),
            cashFlowData: generateCashFlowWaterfall(
                currentPeriod.consolidated,
                calculateBFR(currentPeriod.consolidated)
            )
        };
    }

    /**
     * Update report period
     */
    function updatePeriod(year, month) {
        currentPeriod = {
            year: year,
            month: month,
            entities: {}
        };
        
        // Regenerate data for new period
        Object.keys(ENTITIES).forEach(entityId => {
            currentPeriod.entities[entityId] = generateEntityData(entityId, currentPeriod);
        });
        
        currentPeriod.consolidated = consolidateEntities(currentPeriod.entities);
    }

    // Public API
    return {
        init: function() {
            initializeCurrentPeriod();
        },
        
        ENTITIES: ENTITIES,
        KPI_DEFINITIONS: KPI_DEFINITIONS,
        
        getReportData: getReportData,
        updatePeriod: updatePeriod,
        
        generateEntityData: generateEntityData,
        consolidateEntities: consolidateEntities,
        calculateKPIs: calculateKPIs,
        calculateBFR: calculateBFR,
        
        generateTrendData: generateTrendData,
        calculateGrowthRates: calculateGrowthRates,
        
        exportToExcel: exportToExcel,
        exportToPDF: exportToPDF,
        exportToPowerPoint: exportToPowerPoint,
        
        formatSwissAmount: formatSwissAmount,
        formatPercentage: formatPercentage,
        formatVariance: formatVariance
    };
})();

// Initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        FinancialReports.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialReports;
}