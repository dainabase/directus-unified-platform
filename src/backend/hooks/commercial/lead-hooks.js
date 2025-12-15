/**
 * Lead Hooks - Automatisations Leads
 *
 * Hooks pour les leads:
 * - Attribution automatique
 * - Score lead automatique
 * - Notifications nouveau lead
 * - Sync Mautic
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Lead scoring rules
const SCORING_RULES = {
  has_email: 10,
  has_phone: 10,
  has_company: 15,
  has_budget: 20,
  has_timeline: 15,
  source_referral: 25,
  source_website: 15,
  source_ads: 10,
  source_cold: 5
};

/**
 * Hook: Before Lead Create
 * - Calcule le score initial
 * - Définit le statut initial
 */
export async function beforeLeadCreate(payload, meta) {
  try {
    console.log('🔄 Hook: beforeLeadCreate');

    // Calculate initial score
    if (!payload.score) {
      payload.score = calculateLeadScore(payload);
    }

    // Set default status
    if (!payload.status) {
      payload.status = 'new';
    }

    // Set priority based on score
    if (!payload.priority) {
      if (payload.score >= 70) payload.priority = 'high';
      else if (payload.score >= 40) payload.priority = 'medium';
      else payload.priority = 'low';
    }

    console.log(`✅ Lead prepared with score: ${payload.score}`);
    return payload;
  } catch (error) {
    console.error('❌ beforeLeadCreate error:', error.message);
    return payload;
  }
}

/**
 * Hook: After Lead Create
 * - Envoie notifications
 * - Sync avec Mautic si configuré
 */
export async function afterLeadCreate(meta, context) {
  try {
    const { key, payload } = meta;

    console.log(`🔄 Hook: afterLeadCreate - New lead: ${key}`);

    // Get full lead data
    const lead = await getLead(key);
    if (!lead) return;

    // Notify team of high-priority leads
    if (lead.priority === 'high') {
      await notifyHighPriorityLead(lead);
    }

    // TODO: Sync to Mautic
    // await syncLeadToMautic(lead);

  } catch (error) {
    console.error('❌ afterLeadCreate error:', error.message);
  }
}

/**
 * Hook: After Lead Update
 * - Recalcule le score si données changent
 * - Détecte conversion
 */
export async function afterLeadUpdate(meta, context) {
  try {
    const { keys, payload } = meta;

    // Check for conversion
    if (payload.status === 'converted') {
      for (const leadId of keys) {
        await onLeadConverted(leadId);
      }
      return;
    }

    // Recalculate score if relevant fields changed
    const scoreFields = ['email', 'phone', 'company_name', 'budget', 'timeline', 'source'];
    const shouldRecalculate = scoreFields.some(field => payload[field] !== undefined);

    if (shouldRecalculate) {
      for (const leadId of keys) {
        await recalculateLeadScore(leadId);
      }
    }
  } catch (error) {
    console.error('❌ afterLeadUpdate error:', error.message);
  }
}

/**
 * Calculate lead score based on data
 */
function calculateLeadScore(lead) {
  let score = 0;

  // Basic data completeness
  if (lead.email) score += SCORING_RULES.has_email;
  if (lead.phone) score += SCORING_RULES.has_phone;
  if (lead.company_name) score += SCORING_RULES.has_company;
  if (lead.budget && lead.budget > 0) score += SCORING_RULES.has_budget;
  if (lead.timeline) score += SCORING_RULES.has_timeline;

  // Source-based scoring
  const sourceScores = {
    referral: SCORING_RULES.source_referral,
    website: SCORING_RULES.source_website,
    ads: SCORING_RULES.source_ads,
    cold_outreach: SCORING_RULES.source_cold,
    social_media: SCORING_RULES.source_ads,
    event: SCORING_RULES.source_referral
  };

  if (lead.source && sourceScores[lead.source]) {
    score += sourceScores[lead.source];
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Recalculate and update lead score
 */
async function recalculateLeadScore(leadId) {
  try {
    const lead = await getLead(leadId);
    if (!lead) return;

    const newScore = calculateLeadScore(lead);
    let newPriority = lead.priority;

    if (newScore >= 70) newPriority = 'high';
    else if (newScore >= 40) newPriority = 'medium';
    else newPriority = 'low';

    if (newScore !== lead.score || newPriority !== lead.priority) {
      await api.patch(`/items/leads/${leadId}`, {
        score: newScore,
        priority: newPriority
      });
      console.log(`✅ Lead ${leadId} score updated: ${newScore}`);
    }
  } catch (error) {
    console.error('Error recalculating lead score:', error.message);
  }
}

/**
 * Action: Lead Converted
 * - Log conversion
 * - Update analytics
 */
async function onLeadConverted(leadId) {
  console.log(`🎉 Lead converted: ${leadId}`);

  try {
    // Set conversion timestamp if not set
    const lead = await getLead(leadId);
    if (lead && !lead.converted_at) {
      await api.patch(`/items/leads/${leadId}`, {
        converted_at: new Date().toISOString()
      });
    }

    // TODO: Update analytics/reporting
    // TODO: Trigger celebration notification
  } catch (error) {
    console.error('Error handling lead conversion:', error.message);
  }
}

/**
 * Notify team of high-priority lead
 */
async function notifyHighPriorityLead(lead) {
  console.log(`🔔 High-priority lead alert: ${lead.company_name || lead.email}`);

  // TODO: Send Slack notification
  // TODO: Send email to sales team
  // TODO: Create task in project management

  // For now, just log
  console.log(`  - Score: ${lead.score}`);
  console.log(`  - Source: ${lead.source}`);
  console.log(`  - Company: ${lead.company_name || 'N/A'}`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getLead(leadId) {
  try {
    const res = await api.get(`/items/leads/${leadId}`);
    return res.data.data;
  } catch {
    return null;
  }
}

export default {
  beforeLeadCreate,
  afterLeadCreate,
  afterLeadUpdate
};
