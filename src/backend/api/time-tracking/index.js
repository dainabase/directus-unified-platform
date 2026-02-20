/**
 * Story 7.9 — Time Tracking API (regie / facturation heures)
 *
 * GET    /entries            — List time entries (filters: project_id, contact_id, month, invoiced)
 * POST   /entries            — Create time entry
 * PATCH  /entries/:id        — Update time entry (blocked if invoiced)
 * DELETE /entries/:id        — Delete time entry (blocked if invoiced)
 * GET    /reports            — Monthly report by project / contact
 * POST   /generate-invoice   — Generate regie invoice from uninvoiced entries
 * GET    /export             — CSV export
 * GET    /health             — Health check
 *
 * @version 7.9
 * @author Claude Code
 */

import { Router } from 'express';
import axios from 'axios';
import { directusGet, directusPost, directusPatch, formatCHF, logAutomation, generateInvoiceNumber } from '../../lib/financeUtils.js';

const router = Router();

const INVOICE_NINJA_URL = process.env.INVOICE_NINJA_URL || 'http://localhost:8080';
const INVOICE_NINJA_TOKEN = process.env.INVOICE_NINJA_TOKEN;

// ────────────────────────────────────────────────
// GET /entries — List time entries with filters
// ────────────────────────────────────────────────
router.get('/entries', async (req, res) => {
  try {
    const { project_id, contact_id, month, invoiced, limit, offset } = req.query;

    const filters = {};
    if (project_id) filters['filter[project_id][_eq]'] = project_id;
    if (contact_id) filters['filter[contact_id][_eq]'] = contact_id;
    if (invoiced === 'true') filters['filter[billed][_eq]'] = true;
    if (invoiced === 'false') filters['filter[billed][_eq]'] = false;

    // Month filter: YYYY-MM -> range on date field
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = `${month}-01`;
      const lastDay = new Date(year, mon, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      filters['filter[date][_gte]'] = startDate;
      filters['filter[date][_lte]'] = endDate;
    }

    const entries = await directusGet('/items/time_entries', {
      ...filters,
      sort: '-date',
      limit: parseInt(limit) || 200,
      offset: parseInt(offset) || 0,
      fields: '*,project_id.name,contact_id.first_name,contact_id.last_name'
    });

    const totalHours = (entries || []).reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const totalAmount = (entries || []).reduce((sum, e) => {
      return sum + (parseFloat(e.hours || 0) * parseFloat(e.hourly_rate || 0));
    }, 0);

    res.json({
      success: true,
      entries: entries || [],
      meta: {
        count: (entries || []).length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        total_formatted: formatCHF(totalAmount)
      }
    });
  } catch (error) {
    console.error('[time-tracking] Erreur GET /entries:', error.message);
    res.status(500).json({ success: false, error: 'Erreur lecture entrees temps', details: error.message });
  }
});

// ────────────────────────────────────────────────
// POST /entries — Create time entry
// ────────────────────────────────────────────────
router.post('/entries', async (req, res) => {
  try {
    const { project_id, contact_id, date, hours, hourly_rate, description, category, owner_company } = req.body;

    // Validate required fields
    if (!project_id) {
      return res.status(400).json({ success: false, error: 'project_id requis' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'date requis (format YYYY-MM-DD)' });
    }
    if (!hours || parseFloat(hours) <= 0) {
      return res.status(400).json({ success: false, error: 'hours requis (> 0)' });
    }
    if (!hourly_rate || parseFloat(hourly_rate) <= 0) {
      return res.status(400).json({ success: false, error: 'hourly_rate requis (> 0)' });
    }

    const amount = Math.round(parseFloat(hours) * parseFloat(hourly_rate) * 100) / 100;

    const entry = await directusPost('/items/time_entries', {
      project_id,
      contact_id: contact_id || null,
      date,
      hours: parseFloat(hours),
      hourly_rate: parseFloat(hourly_rate),
      amount,
      description: description || '',
      category: category || 'development',
      billed: false,
      invoice_id: null,
      owner_company: owner_company || null
    });

    console.log(`[time-tracking] Entree creee: ${parseFloat(hours)}h x ${formatCHF(hourly_rate)}/h = ${formatCHF(amount)}`);

    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error('[time-tracking] Erreur POST /entries:', error.message);
    res.status(500).json({ success: false, error: 'Erreur creation entree temps', details: error.message });
  }
});

// ────────────────────────────────────────────────
// PATCH /entries/:id — Update time entry
// ────────────────────────────────────────────────
router.patch('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing entry to check invoiced status
    const existing = await directusGet(`/items/time_entries/${id}`);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Entree non trouvee' });
    }

    if (existing.billed || existing.invoice_id) {
      return res.status(403).json({
        success: false,
        error: 'Impossible de modifier une entree deja facturee',
        invoice_id: existing.invoice_id
      });
    }

    // Build update payload (only allowed fields)
    const allowedFields = ['project_id', 'contact_id', 'date', 'hours', 'hourly_rate', 'description', 'category', 'owner_company'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Recalculate amount if hours or rate changed
    const hours = parseFloat(updateData.hours || existing.hours || 0);
    const rate = parseFloat(updateData.hourly_rate || existing.hourly_rate || 0);
    updateData.amount = Math.round(hours * rate * 100) / 100;

    const updated = await directusPatch(`/items/time_entries/${id}`, updateData);

    console.log(`[time-tracking] Entree ${id} mise a jour`);
    res.json({ success: true, entry: updated });
  } catch (error) {
    console.error('[time-tracking] Erreur PATCH /entries/:id:', error.message);
    res.status(500).json({ success: false, error: 'Erreur mise a jour entree', details: error.message });
  }
});

// ────────────────────────────────────────────────
// DELETE /entries/:id — Delete time entry
// ────────────────────────────────────────────────
router.delete('/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing entry to check invoiced status
    const existing = await directusGet(`/items/time_entries/${id}`);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Entree non trouvee' });
    }

    if (existing.billed || existing.invoice_id) {
      return res.status(403).json({
        success: false,
        error: 'Impossible de supprimer une entree deja facturee',
        invoice_id: existing.invoice_id
      });
    }

    // Directus DELETE via axios directly (directusPatch does not support DELETE)
    const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_TOKEN;

    await axios.delete(`${DIRECTUS_URL}/items/time_entries/${id}`, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
    });

    console.log(`[time-tracking] Entree ${id} supprimee`);
    res.json({ success: true, deleted: true, id });
  } catch (error) {
    console.error('[time-tracking] Erreur DELETE /entries/:id:', error.message);
    res.status(500).json({ success: false, error: 'Erreur suppression entree', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /reports — Monthly report by project
// ────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const { month, project_id } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, error: 'month requis (format YYYY-MM)' });
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const filters = {
      'filter[date][_gte]': startDate,
      'filter[date][_lte]': endDate
    };
    if (project_id) filters['filter[project_id][_eq]'] = project_id;

    const entries = await directusGet('/items/time_entries', {
      ...filters,
      sort: '-date',
      limit: -1,
      fields: '*,project_id.id,project_id.name,contact_id.id,contact_id.first_name,contact_id.last_name'
    });

    const allEntries = entries || [];

    // Aggregate by project
    const byProject = {};
    for (const entry of allEntries) {
      const projId = typeof entry.project_id === 'object' ? entry.project_id?.id : entry.project_id;
      const projName = typeof entry.project_id === 'object' ? entry.project_id?.name : `Projet ${projId}`;
      const key = String(projId);

      if (!byProject[key]) {
        byProject[key] = {
          project_id: projId,
          project_name: projName,
          total_hours: 0,
          total_amount: 0,
          entries_count: 0,
          invoiced_hours: 0,
          uninvoiced_hours: 0
        };
      }
      const h = parseFloat(entry.hours || 0);
      const rate = parseFloat(entry.hourly_rate || 0);
      byProject[key].total_hours += h;
      byProject[key].total_amount += h * rate;
      byProject[key].entries_count += 1;

      if (entry.billed || entry.invoice_id) {
        byProject[key].invoiced_hours += h;
      } else {
        byProject[key].uninvoiced_hours += h;
      }
    }

    // Aggregate by contact
    const byContact = {};
    for (const entry of allEntries) {
      const ctId = typeof entry.contact_id === 'object' ? entry.contact_id?.id : entry.contact_id;
      const ctName = typeof entry.contact_id === 'object'
        ? `${entry.contact_id?.first_name || ''} ${entry.contact_id?.last_name || ''}`.trim()
        : `Contact ${ctId}`;
      const key = String(ctId || 'unassigned');

      if (!byContact[key]) {
        byContact[key] = {
          contact_id: ctId,
          contact_name: ctName || 'Non assigne',
          total_hours: 0,
          total_amount: 0,
          entries_count: 0
        };
      }
      const h = parseFloat(entry.hours || 0);
      const rate = parseFloat(entry.hourly_rate || 0);
      byContact[key].total_hours += h;
      byContact[key].total_amount += h * rate;
      byContact[key].entries_count += 1;
    }

    // Round values
    const roundAgg = (obj) => {
      for (const k of Object.keys(obj)) {
        obj[k].total_hours = Math.round(obj[k].total_hours * 100) / 100;
        obj[k].total_amount = Math.round(obj[k].total_amount * 100) / 100;
        if (obj[k].invoiced_hours !== undefined) {
          obj[k].invoiced_hours = Math.round(obj[k].invoiced_hours * 100) / 100;
          obj[k].uninvoiced_hours = Math.round(obj[k].uninvoiced_hours * 100) / 100;
        }
      }
    };
    roundAgg(byProject);
    roundAgg(byContact);

    const totalHours = allEntries.reduce((s, e) => s + parseFloat(e.hours || 0), 0);
    const totalAmount = allEntries.reduce((s, e) => s + (parseFloat(e.hours || 0) * parseFloat(e.hourly_rate || 0)), 0);

    res.json({
      success: true,
      month,
      summary: {
        total_entries: allEntries.length,
        total_hours: Math.round(totalHours * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        total_formatted: formatCHF(totalAmount)
      },
      by_project: Object.values(byProject),
      by_contact: Object.values(byContact)
    });
  } catch (error) {
    console.error('[time-tracking] Erreur GET /reports:', error.message);
    res.status(500).json({ success: false, error: 'Erreur rapport mensuel', details: error.message });
  }
});

// ────────────────────────────────────────────────
// POST /generate-invoice — Generate regie invoice from time entries
// ────────────────────────────────────────────────
router.post('/generate-invoice', async (req, res) => {
  try {
    const { project_id, month, contact_id } = req.body;

    if (!project_id || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, error: 'project_id et month (YYYY-MM) requis' });
    }

    // 1. Fetch uninvoiced time entries for project/month
    const [year, mon] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const filters = {
      'filter[project_id][_eq]': project_id,
      'filter[date][_gte]': startDate,
      'filter[date][_lte]': endDate,
      'filter[billed][_eq]': false
    };
    if (contact_id) filters['filter[contact_id][_eq]'] = contact_id;

    const entries = await directusGet('/items/time_entries', {
      ...filters,
      sort: 'date',
      limit: -1
    });

    if (!entries || entries.length === 0) {
      return res.status(404).json({ success: false, error: 'Aucune entree non facturee trouvee pour ce projet/mois' });
    }

    // 2. Group by hourly_rate
    const rateGroups = {};
    for (const entry of entries) {
      const rate = parseFloat(entry.hourly_rate || 0);
      const key = rate.toFixed(2);
      if (!rateGroups[key]) {
        rateGroups[key] = { rate, hours: 0, amount: 0, entries: [] };
      }
      const h = parseFloat(entry.hours || 0);
      rateGroups[key].hours += h;
      rateGroups[key].amount += h * rate;
      rateGroups[key].entries.push(entry);
    }

    // 3. Create invoice in Invoice Ninja
    const lineItems = Object.values(rateGroups).map(group => ({
      product_key: `Regie ${formatCHF(group.rate)}/h`,
      notes: `Prestations ${month} - ${Math.round(group.hours * 100) / 100}h a ${formatCHF(group.rate)}/h`,
      quantity: Math.round(group.hours * 100) / 100,
      cost: group.rate,
      tax_name1: 'TVA',
      tax_rate1: 8.1
    }));

    const subtotal = Object.values(rateGroups).reduce((s, g) => s + g.amount, 0);
    let invoiceNinjaResult = null;

    if (INVOICE_NINJA_TOKEN) {
      try {
        // Fetch project info for client mapping
        let clientId = null;
        try {
          const project = await directusGet(`/items/projects/${project_id}`);
          clientId = project?.invoice_ninja_client_id || null;
        } catch { /* optional */ }

        const invoicePayload = {
          line_items: lineItems,
          is_amount_discount: false,
          discount: 0,
          po_number: `REG-${month}-${project_id}`,
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          public_notes: `Facturation en regie - Projet #${project_id} - ${month}`
        };

        if (clientId) {
          invoicePayload.client_id = clientId;
        }

        const ninjaRes = await axios.post(`${INVOICE_NINJA_URL}/api/v1/invoices`, invoicePayload, {
          headers: {
            'X-API-TOKEN': INVOICE_NINJA_TOKEN,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        });
        invoiceNinjaResult = ninjaRes.data?.data || ninjaRes.data;
        console.log(`[time-tracking] Facture Invoice Ninja creee: ${invoiceNinjaResult?.number || 'N/A'}`);
      } catch (ninjaErr) {
        console.warn('[time-tracking] Erreur Invoice Ninja (continue sans):', ninjaErr.message);
      }
    } else {
      console.warn('[time-tracking] INVOICE_NINJA_TOKEN non configure — facture locale uniquement');
    }

    // 4. Create local invoice record in Directus
    const invoiceNumber = await generateInvoiceNumber('REG');
    const taxRate = 8.1;
    const taxAmount = Math.round(subtotal * taxRate) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const localInvoice = await directusPost('/items/client_invoices', {
      invoice_number: invoiceNumber,
      project_id,
      contact_id: contact_id || null,
      amount: Math.round(subtotal * 100) / 100,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      currency: 'CHF',
      status: 'draft',
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      description: `Facturation en regie - ${month} - ${entries.length} entrees - ${formatCHF(subtotal)} HT`,
      type: 'time_and_materials',
      invoice_ninja_id: invoiceNinjaResult?.id || null,
      owner_company: entries[0]?.owner_company || null
    });

    // 5. Mark all entries as invoiced in Directus
    const invoicedAt = new Date().toISOString();
    for (const entry of entries) {
      try {
        await directusPatch(`/items/time_entries/${entry.id}`, {
          billed: true,
          invoice_id: String(localInvoice.id),
          invoiced_at: invoicedAt
        });
      } catch (patchErr) {
        console.warn(`[time-tracking] Erreur marquage entree ${entry.id}:`, patchErr.message);
      }
    }

    // Log automation
    await logAutomation({
      rule_name: '7.9-time-invoice-generated',
      entity_type: 'client_invoices',
      entity_id: String(localInvoice.id),
      status: 'success',
      trigger_data: {
        invoice_number: invoiceNumber,
        project_id,
        month,
        entries_count: entries.length,
        total_hours: Math.round(entries.reduce((s, e) => s + parseFloat(e.hours || 0), 0) * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        total,
        invoice_ninja_id: invoiceNinjaResult?.id || null,
        rate_groups: Object.keys(rateGroups).length
      }
    });

    console.log(`[time-tracking] Facture regie generee: ${invoiceNumber} — ${entries.length} entrees — ${formatCHF(total)} TTC`);

    res.json({
      success: true,
      invoice: localInvoice,
      invoice_ninja: invoiceNinjaResult ? { id: invoiceNinjaResult.id, number: invoiceNinjaResult.number } : null,
      summary: {
        invoice_number: invoiceNumber,
        entries_billed: entries.length,
        total_hours: Math.round(entries.reduce((s, e) => s + parseFloat(e.hours || 0), 0) * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        tax_amount: taxAmount,
        total,
        total_formatted: formatCHF(total),
        rate_groups: Object.values(rateGroups).map(g => ({
          rate: g.rate,
          rate_formatted: formatCHF(g.rate),
          hours: Math.round(g.hours * 100) / 100,
          amount: Math.round(g.amount * 100) / 100
        }))
      }
    });
  } catch (error) {
    console.error('[time-tracking] Erreur POST /generate-invoice:', error.message);
    res.status(500).json({ success: false, error: 'Erreur generation facture regie', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /export — CSV export of time entries
// ────────────────────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { project_id, month, contact_id } = req.query;

    const filters = {};
    if (project_id) filters['filter[project_id][_eq]'] = project_id;
    if (contact_id) filters['filter[contact_id][_eq]'] = contact_id;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = `${month}-01`;
      const lastDay = new Date(year, mon, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      filters['filter[date][_gte]'] = startDate;
      filters['filter[date][_lte]'] = endDate;
    }

    const entries = await directusGet('/items/time_entries', {
      ...filters,
      sort: 'date',
      limit: -1,
      fields: '*,project_id.name,contact_id.first_name,contact_id.last_name'
    });

    const allEntries = entries || [];

    // Build CSV content
    const csvHeader = 'Date;Projet;Contact;Heures;Taux horaire (CHF);Montant (CHF);Description';
    const csvRows = allEntries.map(e => {
      const projName = typeof e.project_id === 'object' ? (e.project_id?.name || '') : `Projet ${e.project_id}`;
      const ctName = typeof e.contact_id === 'object'
        ? `${e.contact_id?.first_name || ''} ${e.contact_id?.last_name || ''}`.trim()
        : (e.contact_id || '');
      const hours = parseFloat(e.hours || 0);
      const rate = parseFloat(e.hourly_rate || 0);
      const amount = Math.round(hours * rate * 100) / 100;
      const desc = (e.description || '').replace(/;/g, ',').replace(/\n/g, ' ');

      // Format date DD.MM.YYYY (Swiss locale fr-CH)
      const dateParts = (e.date || '').split('-');
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
        : e.date;

      return `${formattedDate};${projName};${ctName};${hours};${rate.toFixed(2)};${amount.toFixed(2)};${desc}`;
    });

    const csv = [csvHeader, ...csvRows].join('\n');
    const filename = `time-entries${project_id ? `-proj${project_id}` : ''}${month ? `-${month}` : ''}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM for Excel UTF-8 compatibility
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('[time-tracking] Erreur GET /export:', error.message);
    res.status(500).json({ success: false, error: 'Erreur export CSV', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /health — Health check
// ────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'time-tracking',
    story: '7.9',
    version: '7.9.0',
    endpoints: [
      'GET /entries',
      'POST /entries',
      'PATCH /entries/:id',
      'DELETE /entries/:id',
      'GET /reports',
      'POST /generate-invoice',
      'GET /export',
      'GET /health'
    ],
    invoice_ninja: !!INVOICE_NINJA_TOKEN,
    timestamp: new Date().toISOString()
  });
});

export default router;
