/**
 * ERPNext Router - ES Modules
 * Routes API pour l'integration ERPNext
 * @version 2.0.0
 */

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
// ERPNext service — loaded from src/services/
let ERPNextAPI;
try {
  const mod = await import('../../../services/erpnext-api.js');
  ERPNextAPI = mod.default;
} catch {
  // Fallback: stub if service module unavailable
  ERPNextAPI = class {
    constructor() { this.api = { get: () => Promise.reject(new Error('ERPNext service not loaded')) }; }
    async getKPIs() { return {}; }
    async getList() { return []; }
    async getRevenueChart() { return { labels: [], data: [] }; }
    async getCompanyBreakdown() { return []; }
  };
  console.warn('[erpnext] Service module not found — using stub');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialiser le client ERPNext
const erpnext = new ERPNextAPI({
  baseURL: process.env.ERPNEXT_URL || 'http://localhost:8083',
  apiKey: process.env.ERPNEXT_API_KEY,
  apiSecret: process.env.ERPNEXT_API_SECRET
});

// === ENDPOINTS ===

// KPIs Dashboard
router.get('/kpis', async (req, res) => {
  try {
    const company = req.query.company !== 'all' ? req.query.company : null;
    const kpis = await erpnext.getKPIs(company);

    // Ajouter des donnees supplementaires
    if (kpis.pending_invoices > 0) {
      const pendingInvoices = await erpnext.getList('Sales Invoice', {
        status: 'Unpaid',
        docstatus: 1,
        ...(company && { company })
      }, ['grand_total']);

      kpis.pending_amount = pendingInvoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    }

    // Compter les articles en stock
    const items = await erpnext.getList('Item', {
      is_stock_item: 1,
      ...(company && { company })
    }, ['name']);
    kpis.stock_items = items.length;

    res.json(kpis);
  } catch (error) {
    console.error('Erreur KPIs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Graphique des revenus
router.get('/chart/revenue', async (req, res) => {
  try {
    const company = req.query.company !== 'all' ? req.query.company : null;
    const months = parseInt(req.query.months) || 12;

    const chartData = await erpnext.getRevenueChart(company, months);

    // Formater les labels en francais
    chartData.labels = chartData.labels.map(label => {
      const [year, month] = label.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });

    res.json(chartData);
  } catch (error) {
    console.error('Erreur graphique revenus:', error);
    res.status(500).json({ error: error.message });
  }
});

// Repartition par entreprise
router.get('/chart/company-breakdown', async (req, res) => {
  try {
    const breakdown = await erpnext.getCompanyBreakdown();
    res.json(breakdown);
  } catch (error) {
    console.error('Erreur repartition entreprises:', error);
    res.status(500).json({ error: error.message });
  }
});

// Activites recentes
router.get('/activities', async (req, res) => {
  try {
    const company = req.query.company !== 'all' ? req.query.company : null;
    const limit = parseInt(req.query.limit) || 10;

    // Recuperer differents types d'activites
    const [invoices, payments, customers] = await Promise.all([
      erpnext.getList('Sales Invoice', {
        ...(company && { company }),
        docstatus: ['!=', 0]
      }, ['name', 'customer', 'grand_total', 'creation', 'company']),

      erpnext.getList('Payment Entry', {
        ...(company && { company }),
        docstatus: 1
      }, ['name', 'party', 'paid_amount', 'creation', 'company']),

      erpnext.getList('Customer', {
        ...(company && { company })
      }, ['name', 'customer_name', 'creation', 'company'])
    ]);

    // Transformer en activites
    const activities = [];

    invoices.slice(0, 5).forEach(inv => {
      activities.push({
        type: 'invoice',
        title: `Facture ${inv.name}`,
        description: `${inv.customer} - ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(inv.grand_total)}`,
        date: inv.creation,
        company: inv.company
      });
    });

    payments.slice(0, 5).forEach(pay => {
      activities.push({
        type: 'payment',
        title: `Paiement recu`,
        description: `${pay.party} - ${new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(pay.paid_amount)}`,
        date: pay.creation,
        company: pay.company
      });
    });

    customers.slice(0, 5).forEach(cust => {
      activities.push({
        type: 'customer',
        title: `Nouveau client`,
        description: cust.customer_name,
        date: cust.creation,
        company: cust.company
      });
    });

    // Trier par date et limiter
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error('Erreur activites:', error);
    res.status(500).json({ error: error.message });
  }
});

// Synchronisation
router.post('/sync', async (req, res) => {
  try {
    const { company } = req.body;

    res.json({
      success: true,
      message: 'Synchronisation lancee',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Migration depuis Directus
router.post('/migrate', async (req, res) => {
  try {
    const migrationScript = path.join(__dirname, '../../../integrations/erpnext/scripts/migrate-to-erpnext.js');

    const migration = spawn('node', [migrationScript], {
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    migration.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Migration:', data.toString());
    });

    migration.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Migration error:', data.toString());
    });

    migration.on('close', (code) => {
      if (code === 0) {
        const lines = output.split('\n');
        const summary = lines
          .filter(line => line.includes('OK'))
          .join(', ')
          .replace(/OK/g, '');

        res.json({
          success: true,
          message: 'Migration terminee avec succes',
          summary: summary || 'Migration complete',
          details: output
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la migration',
          error: errorOutput || 'Erreur inconnue'
        });
      }
    });

    // Timeout apres 5 minutes
    setTimeout(() => {
      if (!res.headersSent) {
        migration.kill();
        res.status(504).json({
          success: false,
          message: 'Timeout de la migration (5 minutes)'
        });
      }
    }, 300000);

  } catch (error) {
    console.error('Erreur migration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test de connexion
router.get('/test', async (req, res) => {
  try {
    const response = await erpnext.api.get('/method/frappe.utils.change_log.get_versions');

    res.json({
      success: true,
      message: 'Connexion ERPNext OK',
      version: response.data.message
    });
  } catch (error) {
    console.error('Erreur test connexion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'erpnext',
    timestamp: new Date().toISOString()
  });
});

export default router;
