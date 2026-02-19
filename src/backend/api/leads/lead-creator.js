/**
 * Service commun : creation/mise a jour lead dans Directus
 * Utilise par F-01 (WordPress), F-03 (IMAP), F-04 (Ringover)
 *
 * Pattern : helpers directusGet/directusPost injectes depuis index.js
 * Champs leads verifies via MCP : id(int), first_name, last_name, email, phone,
 *   company_name, source(uuid→lead_sources), status, score, notes, tags(json),
 *   source_channel, source_detail, raw_data, openai_summary, ringover_call_id, call_duration
 */

/**
 * Recuperer ou creer une source dans lead_sources
 */
async function getOrCreateLeadSource(directusGet, directusPost, code, name) {
  try {
    const existing = await directusGet('/items/lead_sources', {
      'filter[code][_eq]': code,
      limit: 1
    });
    if (existing && existing.length > 0) {
      return existing[0].id;
    }
    const created = await directusPost('/items/lead_sources', {
      name,
      code,
      is_active: true
    });
    return created?.id || null;
  } catch (e) {
    console.error('[LeadCreator] getOrCreateLeadSource error:', e.message);
    return null;
  }
}

/**
 * Chercher un lead existant par email ou telephone
 */
async function findExistingLead(directusGet, email, phone) {
  if (!email && !phone) return null;
  try {
    const filter = email
      ? { 'filter[email][_eq]': email }
      : { 'filter[phone][_eq]': phone };
    const results = await directusGet('/items/leads', {
      ...filter,
      limit: 1,
      sort: '-date_created'
    });
    return results?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Creer ou mettre a jour un lead
 * @param {Function} directusGet - helper GET Directus
 * @param {Function} directusPost - helper POST Directus
 * @param {Function} directusPatch - helper PATCH Directus
 * @param {Object} leadData - donnees du lead
 * @param {string} sourceCode - code source ('wp_form_17', 'imap_info', 'ringover_polling')
 * @returns {Object} lead cree ou mis a jour
 */
async function createOrUpdateLead(directusGet, directusPost, directusPatch, leadData, sourceCode) {
  const sourceNames = {
    wp_form_17: 'WordPress Form #17',
    imap_info: 'Email info@hypervisual.ch',
    ringover_polling: 'Ringover Telephone'
  };

  // Recuperer/creer la source
  const sourceId = await getOrCreateLeadSource(
    directusGet,
    directusPost,
    sourceCode,
    sourceNames[sourceCode] || sourceCode
  );

  // Verifier lead existant (upsert par email/phone)
  const existing = await findExistingLead(directusGet, leadData.email, leadData.phone);

  if (existing && leadData.source_channel !== 'ringover') {
    // Mettre a jour le lead existant (ne pas ecraser avec des donnees partielles Ringover)
    console.log(`[LeadCreator] Lead existant (ID: ${existing.id}), mise a jour...`);
    const updated = await directusPatch(`/items/leads/${existing.id}`, {
      source_channel: leadData.source_channel,
      source_detail: leadData.source_detail,
      date_updated: new Date().toISOString()
    });
    return updated || existing;
  }

  // Construire le payload
  const payload = {
    first_name: leadData.first_name || '',
    last_name: leadData.last_name || '',
    email: leadData.email || null,
    phone: leadData.phone || null,
    company_name: leadData.company_name || null,
    notes: leadData.message || null,
    status: leadData.status || 'new',
    source: sourceId || null,
    source_channel: leadData.source_channel || null,
    source_detail: leadData.source_detail || null,
    raw_data: leadData.raw_data || null,
    openai_summary: leadData.openai_summary || null,
    ringover_call_id: leadData.ringover_call_id || null,
    call_duration: leadData.call_duration || null
  };

  // Supprimer champs null pour eviter d'ecraser des defaults Directus
  Object.keys(payload).forEach(k => {
    if (payload[k] === null || payload[k] === undefined) delete payload[k];
  });

  console.log(`[LeadCreator] Creation lead: ${payload.first_name} ${payload.last_name} via ${payload.source_channel}`);
  const created = await directusPost('/items/leads', payload);
  return created;
}

export { createOrUpdateLead, findExistingLead, getOrCreateLeadSource };
