/**
 * KPI Thresholds & Alerts — Phase J-02
 * GET /alerts — KPIs en alerte (critical / warning)
 * PUT /thresholds — modifier seuils, stockés dans settings (key: kpi_thresholds)
 * GET /thresholds — récupérer seuils actuels
 */

import { Router } from 'express';
import { directusGet, directusPost, directusPatch } from '../../lib/financeUtils.js';

const router = Router();

// ── Default thresholds ──
const DEFAULT_THRESHOLDS = {
  MRR:     { warning: 60000,  critical: 40000,  unit: 'CHF',  direction: 'below' },
  ARR:     { warning: 700000, critical: 500000, unit: 'CHF',  direction: 'below' },
  RUNWAY:  { warning: 6,      critical: 3,      unit: 'mois', direction: 'below' },
  NPS:     { warning: 50,     critical: 30,     unit: 'pts',  direction: 'below' },
  LTV_CAC: { warning: 3,      critical: 2,      unit: 'x',    direction: 'below' },
  EBITDA:  { warning: 0,      critical: -10000, unit: 'CHF',  direction: 'below' }
};

/**
 * Get thresholds from Directus settings or use defaults.
 */
async function getThresholds() {
  try {
    const settings = await directusGet('/items/settings', {
      'filter[key][_eq]': 'kpi_thresholds',
      limit: 1
    });
    if (settings && settings.length > 0 && settings[0].value) {
      const stored = typeof settings[0].value === 'string'
        ? JSON.parse(settings[0].value)
        : settings[0].value;
      return { ...DEFAULT_THRESHOLDS, ...stored };
    }
  } catch {
    // settings collection may not exist — use defaults
  }
  return DEFAULT_THRESHOLDS;
}

/**
 * GET /api/kpis/thresholds
 * Returns current threshold configuration.
 */
router.get('/thresholds', async (req, res) => {
  try {
    const thresholds = await getThresholds();
    res.json({ thresholds });
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération seuils', details: err.message });
  }
});

/**
 * PUT /api/kpis/thresholds
 * Update threshold configuration in Directus settings.
 */
router.put('/thresholds', async (req, res) => {
  try {
    const newThresholds = req.body;
    if (!newThresholds || typeof newThresholds !== 'object') {
      return res.status(400).json({ error: 'Seuils invalides' });
    }

    // Merge with defaults
    const merged = { ...DEFAULT_THRESHOLDS, ...newThresholds };
    const valueStr = JSON.stringify(merged);

    // Try to update existing setting
    try {
      const existing = await directusGet('/items/settings', {
        'filter[key][_eq]': 'kpi_thresholds',
        limit: 1,
        fields: 'id'
      });

      if (existing && existing.length > 0) {
        await directusPatch(`/items/settings/${existing[0].id}`, { value: valueStr });
      } else {
        await directusPost('/items/settings', { key: 'kpi_thresholds', value: valueStr });
      }
    } catch {
      // settings collection may not exist — store in memory only
      console.warn('[kpis/thresholds] Cannot persist thresholds — settings collection unavailable');
    }

    res.json({ success: true, thresholds: merged });
  } catch (err) {
    res.status(500).json({ error: 'Erreur sauvegarde seuils', details: err.message });
  }
});

/**
 * GET /api/kpis/alerts
 * Returns KPIs that are in alert state (warning or critical).
 */
router.get('/alerts', async (req, res) => {
  try {
    const company = req.query.company || 'HYPERVISUAL';
    const thresholds = await getThresholds();

    // Fetch latest KPI values
    const allKpis = await directusGet('/items/kpis', {
      'filter[owner_company][_eq]': company,
      sort: '-date',
      limit: 200,
      fields: 'metric_name,value,date'
    });

    // Get latest value per metric
    const latestByMetric = {};
    for (const kpi of allKpis) {
      if (!latestByMetric[kpi.metric_name]) {
        latestByMetric[kpi.metric_name] = {
          value: parseFloat(kpi.value || 0),
          date: kpi.date
        };
      }
    }

    // Check against thresholds
    const alerts = [];
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const kpiData = latestByMetric[metric];
      if (!kpiData) continue;

      const { value } = kpiData;
      let level = null;

      if (threshold.direction === 'below') {
        if (value <= threshold.critical) level = 'critical';
        else if (value <= threshold.warning) level = 'warning';
      } else {
        // direction === 'above'
        if (value >= threshold.critical) level = 'critical';
        else if (value >= threshold.warning) level = 'warning';
      }

      if (level) {
        const thresholdValue = level === 'critical' ? threshold.critical : threshold.warning;
        alerts.push({
          metric,
          level,
          value: kpiData.value,
          threshold: thresholdValue,
          unit: threshold.unit,
          date: kpiData.date,
          message: `${metric} ${level === 'critical' ? 'critique' : 'attention'} — ${formatValue(kpiData.value, threshold.unit)} (seuil: ${formatValue(thresholdValue, threshold.unit)})`
        });
      }
    }

    // Sort: critical first
    alerts.sort((a, b) => (a.level === 'critical' ? 0 : 1) - (b.level === 'critical' ? 0 : 1));

    res.json({ alerts, company, checked_at: new Date().toISOString() });
  } catch (err) {
    console.error('[kpis/alerts] Error:', err.message);
    res.status(500).json({ error: 'Erreur vérification alertes', details: err.message });
  }
});

function formatValue(value, unit) {
  if (unit === 'CHF') return `CHF ${Math.round(value).toLocaleString('fr-CH')}`;
  if (unit === 'mois') return `${value.toFixed(1)} mois`;
  if (unit === 'pts') return `${value.toFixed(1)} pts`;
  if (unit === 'x') return `${value.toFixed(2)}x`;
  return String(value);
}

export default router;
