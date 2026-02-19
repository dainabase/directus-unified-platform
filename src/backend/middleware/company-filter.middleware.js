/**
 * Company Filter Middleware
 * Automatically adds company_id filter for non-superadmin users.
 *
 * Attaches req.directusFilter which route handlers should merge
 * into their Directus queries.
 *
 * @version 1.0.0
 * @date 2026-02-19
 */

/**
 * Adds a Directus filter for company-scoped data.
 * SuperAdmin users bypass this filter entirely.
 */
export const companyFilter = (req, res, next) => {
  if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
    req.directusFilter = {};
    return next();
  }

  if (req.user?.companies?.length > 0) {
    // Filter to user's assigned companies (owner_company field)
    req.directusFilter = {
      owner_company: { _in: req.user.companies }
    };
  } else if (req.user?.company_id) {
    req.directusFilter = {
      owner_company: { _eq: req.user.company_id }
    };
  } else {
    req.directusFilter = {};
  }

  next();
};

export default companyFilter;
