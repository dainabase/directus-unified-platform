/**
 * CEO Report Routes — S-06-04
 * GET /api/reports/ceo-daily         — rapport CEO quotidien
 * GET /api/reports/ceo-daily?company= — filtre par entreprise
 */

import express from 'express'
import { generateCEOReport } from '../../services/reports/ceo-daily-report.service.js'

const router = express.Router()

/**
 * GET /api/reports/ceo-daily
 * Genere le rapport quotidien CEO.
 * Query: ?company=uuid  (optionnel, filtre par owner_company)
 */
router.get('/ceo-daily', async (req, res) => {
  try {
    const companyId = req.query.company || null
    const report = await generateCEOReport(companyId)
    res.json({ success: true, data: report })
  } catch (err) {
    console.error('[ceo-report] Error:', err.message)
    res.status(500).json({ success: false, error: 'Erreur generation rapport CEO' })
  }
})

/**
 * GET /api/reports/health
 */
router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'healthy', service: 'reports', version: '1.0.0' })
})

export default router
