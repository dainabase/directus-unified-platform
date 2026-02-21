/**
 * RBAC Configuration — HYPERVISUAL Unified Platform
 * 4 Roles: superadmin, client, prestataire, revendeur
 * Permission format: 'resource.action' (e.g., 'finance.read')
 *
 * @version 1.0.0
 * @author Claude Code
 */

export const ROLES = {
  superadmin: {
    label: 'Super Administrateur / CEO',
    inherits: [],
    permissions: [
      '*.*', // Full access
    ],
  },
  client: {
    label: 'Client',
    inherits: [],
    permissions: [
      'projects.read',        // View own projects
      'projects.list',        // List own projects
      'invoices.read',        // View own invoices
      'invoices.list',        // List own invoices
      'quotes.read',          // View own quotes
      'quotes.sign',          // Sign quotes (DocuSeal)
      'documents.read',       // View own documents
      'documents.download',   // Download documents
      'support.create',       // Create support tickets
      'support.read',         // View own tickets
      'support.reply',        // Reply to tickets
      'payments.read',        // View payment status
      'payments.pay',         // Make payments
      'profile.read',         // View own profile
      'profile.update',       // Update own profile
      'notifications.read',   // View notifications
      'notifications.update', // Mark as read
    ],
  },
  prestataire: {
    label: 'Prestataire / Freelance',
    inherits: [],
    permissions: [
      'missions.read',        // View assigned missions
      'missions.list',        // List assigned missions
      'tasks.read',           // View assigned tasks
      'tasks.update',         // Update task status
      'tasks.list',           // List assigned tasks
      'time-tracking.create', // Log time entries
      'time-tracking.read',   // View own time entries
      'time-tracking.update', // Edit own time entries
      'time-tracking.delete', // Delete own time entries
      'invoices.create',      // Submit invoices
      'invoices.read',        // View own invoices
      'invoices.list',        // List own invoices
      'documents.read',       // View shared documents
      'documents.upload',     // Upload deliverables
      'messages.read',        // View messages
      'messages.create',      // Send messages
      'calendar.read',        // View calendar
      'knowledge.read',       // View knowledge base
      'profile.read',         // View own profile
      'profile.update',       // Update own profile
      'notifications.read',
      'notifications.update',
    ],
  },
  revendeur: {
    label: 'Revendeur / Partenaire',
    inherits: [],
    permissions: [
      'leads.create',         // Create leads
      'leads.read',           // View own leads
      'leads.update',         // Update own leads
      'leads.list',           // List own leads
      'pipeline.read',        // View pipeline
      'pipeline.update',      // Move leads in pipeline
      'quotes.create',        // Create quotes for leads
      'quotes.read',          // View own quotes
      'quotes.list',          // List own quotes
      'clients.read',         // View own clients (converted leads)
      'clients.list',         // List own clients
      'commissions.read',     // View own commissions
      'commissions.list',     // List commissions
      'marketing.read',       // View marketing assets
      'marketing.download',   // Download assets
      'reports.read',         // View own reports
      'profile.read',
      'profile.update',
      'notifications.read',
      'notifications.update',
    ],
  },
};

/**
 * Check if a role has a specific permission
 * Supports wildcard matching: '*.*' matches everything
 *
 * @param {string} role - Role name (superadmin, client, prestataire, revendeur)
 * @param {string} permission - Permission string (e.g., 'finance.read')
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const config = ROLES[role];
  if (!config) return false;

  const allPerms = getRolePermissions(role);
  const [reqResource, reqAction] = permission.split('.');

  return allPerms.some(p => {
    const [pResource, pAction] = p.split('.');
    return (pResource === reqResource || pResource === '*') &&
           (pAction === reqAction || pAction === '*');
  });
}

/**
 * Get all permissions for a role (including inherited)
 *
 * @param {string} role - Role name
 * @returns {string[]} Array of permission strings
 */
export function getRolePermissions(role) {
  const config = ROLES[role];
  if (!config) return [];

  let perms = [...config.permissions];
  for (const inherited of config.inherits) {
    perms = [...perms, ...getRolePermissions(inherited)];
  }
  return [...new Set(perms)];
}

/**
 * Get all defined roles
 * @returns {string[]}
 */
export function getAllRoles() {
  return Object.keys(ROLES);
}

/**
 * Get role label for display
 * @param {string} role
 * @returns {string|null}
 */
export function getRoleLabel(role) {
  return ROLES[role]?.label || null;
}

/**
 * Middleware: requireOwnership
 * Ensures the authenticated user owns the resource (via owner_company or contact_id)
 *
 * @param {string} ownerField - The field name that identifies ownership
 * @returns {Function} Express middleware
 */
export const requireOwnership = (ownerField = 'owner_company') => {
  return (req, res, next) => {
    // Superadmin bypasses ownership checks
    if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
      return next();
    }
    // For other roles, mark the ownership check field for later validation
    // when the resource is actually fetched from the database
    req.ownershipCheck = ownerField;
    next();
  };
};

export default ROLES;
