/**
 * CGV Service - Gestion des Conditions Générales de Vente
 *
 * Fonctionnalités:
 * - Versioning des CGV
 * - Gestion des acceptations avec preuve légale
 * - Génération PDF
 * - Audit trail complet
 *
 * @date 15 Décembre 2025
 */

import axios from 'axios';
import crypto from 'crypto';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || 'hbQz-9935crJ2YkLul_zpQJDBw2M-y5v';

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Créer une nouvelle version de CGV
 */
export async function createCGVVersion(data) {
  try {
    const {
      owner_company_id,
      title,
      content_html,
      content_markdown,
      effective_date
    } = data;

    if (!owner_company_id || !content_html) {
      throw new Error('owner_company_id et content_html sont requis');
    }

    // Get current max version for this company
    const existingRes = await api.get('/items/cgv_versions', {
      params: {
        filter: {
          owner_company_id: { _eq: owner_company_id }
        },
        sort: ['-version'],
        limit: 1,
        fields: ['version']
      }
    });

    const nextVersion = existingRes.data.data.length > 0
      ? parseFloat(existingRes.data.data[0].version) + 0.1
      : 1.0;

    // Generate hash for integrity verification
    const contentHash = crypto.createHash('sha256')
      .update(content_html)
      .digest('hex');

    // Create new version as draft
    const cgvData = {
      owner_company_id,
      version: nextVersion.toFixed(1),
      title: title || `CGV v${nextVersion.toFixed(1)}`,
      content_html,
      content_markdown,
      content_hash: contentHash,
      status: 'draft',
      effective_date: effective_date || null
    };

    const res = await api.post('/items/cgv_versions', cgvData);

    console.log(`✅ CGV version ${nextVersion.toFixed(1)} created for company ${owner_company_id}`);

    return {
      success: true,
      cgv: res.data.data,
      version: nextVersion.toFixed(1)
    };
  } catch (error) {
    console.error('Error creating CGV version:', error.message);
    throw error;
  }
}

/**
 * Activer une version de CGV (désactive les précédentes)
 */
export async function activateCGVVersion(cgvId) {
  try {
    // Get CGV to activate
    const cgvRes = await api.get(`/items/cgv_versions/${cgvId}`);
    const cgv = cgvRes.data.data;

    if (!cgv) {
      throw new Error('CGV version not found');
    }

    // Deactivate all other versions for this company
    await api.patch('/items/cgv_versions', {
      query: {
        filter: {
          _and: [
            { owner_company_id: { _eq: cgv.owner_company_id } },
            { status: { _eq: 'active' } }
          ]
        }
      }
    }, {
      status: 'archived'
    });

    // Activate the new version
    const now = new Date().toISOString();
    await api.patch(`/items/cgv_versions/${cgvId}`, {
      status: 'active',
      effective_date: cgv.effective_date || now.split('T')[0]
    });

    console.log(`✅ CGV version ${cgv.version} activated`);

    return {
      success: true,
      version: cgv.version
    };
  } catch (error) {
    console.error('Error activating CGV version:', error.message);
    throw error;
  }
}

/**
 * Récupérer la CGV active pour une entreprise
 */
export async function getActiveCGV(ownerCompanyId) {
  try {
    const res = await api.get('/items/cgv_versions', {
      params: {
        filter: {
          _and: [
            { owner_company_id: { _eq: ownerCompanyId } },
            { status: { _eq: 'active' } }
          ]
        },
        sort: ['-version'],
        limit: 1
      }
    });

    return res.data.data[0] || null;
  } catch (error) {
    console.error('Error getting active CGV:', error.message);
    return null;
  }
}

/**
 * Lister toutes les versions CGV d'une entreprise
 */
export async function listCGVVersions(ownerCompanyId) {
  try {
    const res = await api.get('/items/cgv_versions', {
      params: {
        filter: {
          owner_company_id: { _eq: ownerCompanyId }
        },
        sort: ['-version'],
        fields: ['id', 'version', 'title', 'status', 'effective_date', 'date_created']
      }
    });

    return res.data.data;
  } catch (error) {
    console.error('Error listing CGV versions:', error.message);
    return [];
  }
}

/**
 * Enregistrer une acceptation de CGV
 */
export async function recordAcceptance(data) {
  try {
    const {
      contact_id,
      company_id,
      cgv_version_id,
      quote_id,
      ip_address,
      user_agent,
      acceptance_method = 'portal_checkbox'
    } = data;

    if (!contact_id || !cgv_version_id) {
      throw new Error('contact_id et cgv_version_id sont requis');
    }

    // Get CGV content for snapshot
    const cgvRes = await api.get(`/items/cgv_versions/${cgv_version_id}`);
    const cgv = cgvRes.data.data;

    if (!cgv) {
      throw new Error('CGV version not found');
    }

    // Verify CGV hash integrity
    const currentHash = crypto.createHash('sha256')
      .update(cgv.content_html)
      .digest('hex');

    if (cgv.content_hash && cgv.content_hash !== currentHash) {
      console.warn('⚠️ CGV content hash mismatch - possible tampering');
    }

    // Create acceptance record
    const acceptanceData = {
      contact_id,
      company_id,
      cgv_version_id,
      quote_id,
      accepted_at: new Date().toISOString(),
      ip_address,
      user_agent,
      acceptance_method,
      cgv_content_snapshot: cgv.content_html,
      cgv_hash: currentHash,
      is_valid: true
    };

    const res = await api.post('/items/cgv_acceptances', acceptanceData);

    console.log(`✅ CGV acceptance recorded: contact ${contact_id}, version ${cgv.version}`);

    return {
      success: true,
      acceptance: res.data.data,
      cgv_version: cgv.version
    };
  } catch (error) {
    console.error('Error recording CGV acceptance:', error.message);
    throw error;
  }
}

/**
 * Vérifier si un contact a accepté les CGV actuelles
 */
export async function hasAcceptedCurrentCGV(contactId, ownerCompanyId) {
  try {
    // Get active CGV
    const activeCGV = await getActiveCGV(ownerCompanyId);
    if (!activeCGV) {
      return { accepted: false, reason: 'no_active_cgv' };
    }

    // Check for acceptance
    const res = await api.get('/items/cgv_acceptances', {
      params: {
        filter: {
          _and: [
            { contact_id: { _eq: contactId } },
            { cgv_version_id: { _eq: activeCGV.id } },
            { is_valid: { _eq: true } }
          ]
        },
        limit: 1,
        fields: ['id', 'accepted_at', 'acceptance_method']
      }
    });

    if (res.data.data.length > 0) {
      return {
        accepted: true,
        acceptance: res.data.data[0],
        cgv_version: activeCGV.version
      };
    }

    return {
      accepted: false,
      reason: 'not_accepted',
      current_cgv_version: activeCGV.version
    };
  } catch (error) {
    console.error('Error checking CGV acceptance:', error.message);
    return { accepted: false, reason: 'error' };
  }
}

/**
 * Récupérer l'historique des acceptations d'un contact
 */
export async function getAcceptanceHistory(contactId, ownerCompanyId = null) {
  try {
    const filter = { contact_id: { _eq: contactId } };

    const res = await api.get('/items/cgv_acceptances', {
      params: {
        filter,
        sort: ['-accepted_at'],
        fields: [
          '*',
          'cgv_version_id.id',
          'cgv_version_id.version',
          'cgv_version_id.title',
          'cgv_version_id.owner_company_id'
        ]
      }
    });

    let acceptances = res.data.data;

    // Filter by owner company if specified
    if (ownerCompanyId) {
      acceptances = acceptances.filter(
        a => a.cgv_version_id?.owner_company_id === ownerCompanyId
      );
    }

    return acceptances;
  } catch (error) {
    console.error('Error getting acceptance history:', error.message);
    return [];
  }
}

/**
 * Invalider une acceptation (usage admin uniquement)
 */
export async function invalidateAcceptance(acceptanceId, reason) {
  try {
    await api.patch(`/items/cgv_acceptances/${acceptanceId}`, {
      is_valid: false,
      invalidation_reason: reason,
      invalidated_at: new Date().toISOString()
    });

    console.log(`⚠️ CGV acceptance ${acceptanceId} invalidated: ${reason}`);

    return { success: true };
  } catch (error) {
    console.error('Error invalidating acceptance:', error.message);
    throw error;
  }
}

/**
 * Statistiques CGV
 */
export async function getCGVStats(ownerCompanyId) {
  try {
    // Get all versions
    const versionsRes = await api.get('/items/cgv_versions', {
      params: {
        filter: { owner_company_id: { _eq: ownerCompanyId } },
        fields: ['id', 'version', 'status']
      }
    });

    const versions = versionsRes.data.data;
    const activeVersion = versions.find(v => v.status === 'active');

    // Get acceptance counts
    const acceptancesRes = await api.get('/items/cgv_acceptances', {
      params: {
        filter: {
          cgv_version_id: { _in: versions.map(v => v.id) }
        },
        aggregate: {
          count: '*'
        },
        groupBy: ['cgv_version_id', 'is_valid']
      }
    });

    return {
      total_versions: versions.length,
      active_version: activeVersion?.version || null,
      acceptances_by_version: acceptancesRes.data.data
    };
  } catch (error) {
    console.error('Error getting CGV stats:', error.message);
    return null;
  }
}

export default {
  createCGVVersion,
  activateCGVVersion,
  getActiveCGV,
  listCGVVersions,
  recordAcceptance,
  hasAcceptedCurrentCGV,
  getAcceptanceHistory,
  invalidateAcceptance,
  getCGVStats
};
