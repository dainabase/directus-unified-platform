/**
 * Pagination Utility — Standard pagination for all API responses
 */

/**
 * Parse pagination params from query string
 * @param {object} query - Express req.query
 * @param {object} defaults - Default values
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query, defaults = { page: 1, limit: 25, maxLimit: 100 }) {
  const page = Math.max(1, parseInt(query.page) || defaults.page)
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || defaults.limit),
    defaults.maxLimit
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Build paginated response envelope
 */
export function paginatedResponse(data, total, { page, limit }) {
  const totalPages = Math.ceil(total / limit)
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export default { parsePagination, paginatedResponse }
