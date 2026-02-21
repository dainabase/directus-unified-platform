/**
 * Story 8.8 — Prometheus Metrics Middleware
 *
 * Exposes /metrics endpoint for Prometheus scraping.
 * Tracks: HTTP request count, duration histogram, active requests gauge,
 *         error rate counter, and custom business gauges.
 *
 * prom-client is OPTIONAL — if not installed, the middleware is a no-op
 * and /metrics returns a 503.
 *
 * @version 8.8.0
 * @author Claude Code
 */

let client = null;
let register = null;
let httpRequestsTotal = null;
let httpRequestDuration = null;
let httpActiveRequests = null;
let httpErrorsTotal = null;
let dbConnectionsGauge = null;
let workflowExecutionsTotal = null;

try {
  client = await import('prom-client');
  register = new client.Registry();

  // Default metrics (CPU, memory, event loop, GC)
  client.collectDefaultMetrics({ register, prefix: 'hypervisual_' });

  // ── HTTP Request Counter ──
  httpRequestsTotal = new client.Counter({
    name: 'hypervisual_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });

  // ── HTTP Request Duration Histogram ──
  httpRequestDuration = new client.Histogram({
    name: 'hypervisual_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register]
  });

  // ── Active Requests Gauge ──
  httpActiveRequests = new client.Gauge({
    name: 'hypervisual_http_active_requests',
    help: 'Number of currently active HTTP requests',
    registers: [register]
  });

  // ── HTTP Error Counter ──
  httpErrorsTotal = new client.Counter({
    name: 'hypervisual_http_errors_total',
    help: 'Total number of HTTP errors (4xx and 5xx)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  });

  // ── Database Connections Gauge (placeholder — set externally) ──
  dbConnectionsGauge = new client.Gauge({
    name: 'hypervisual_db_connections_active',
    help: 'Number of active database connections',
    registers: [register]
  });

  // ── Workflow Executions Counter ──
  workflowExecutionsTotal = new client.Counter({
    name: 'hypervisual_workflow_executions_total',
    help: 'Total workflow executions',
    labelNames: ['workflow', 'status'],
    registers: [register]
  });

  console.log('[metrics] prom-client loaded — Prometheus metrics available at /metrics');
} catch {
  console.warn('[metrics] prom-client not installed — /metrics endpoint disabled. Run: npm install prom-client');
}

/**
 * Normalize route path to reduce cardinality.
 * Replaces UUIDs and numeric IDs with placeholders.
 */
function normalizeRoute(path) {
  if (!path) return 'unknown';
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/\d+/g, '/:id')
    .replace(/\?.*/g, '');
}

/**
 * Express middleware — tracks request metrics.
 */
export function metricsMiddleware(req, res, next) {
  if (!client || !register) return next();

  // Skip metrics endpoint itself to avoid recursion
  if (req.path === '/metrics') return next();

  const start = process.hrtime.bigint();
  httpActiveRequests.inc();

  res.on('finish', () => {
    httpActiveRequests.dec();

    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSec = durationNs / 1e9;
    const route = normalizeRoute(req.route?.path || req.path);
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSec);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  });

  next();
}

/**
 * GET /metrics — Prometheus scrape endpoint.
 */
export async function metricsEndpoint(req, res) {
  if (!register) {
    return res.status(503).set('Content-Type', 'text/plain').send(
      '# prom-client not installed. Run: npm install prom-client\n'
    );
  }

  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType).send(metrics);
  } catch (err) {
    console.error('[metrics] Error generating metrics:', err.message);
    res.status(500).set('Content-Type', 'text/plain').send(
      `# Error generating metrics: ${err.message}\n`
    );
  }
}

/**
 * Set database connections gauge value (call from pool events).
 */
export function setDbConnections(count) {
  if (dbConnectionsGauge) {
    dbConnectionsGauge.set(count);
  }
}

/**
 * Increment workflow execution counter.
 */
export function recordWorkflowExecution(workflow, status) {
  if (workflowExecutionsTotal) {
    workflowExecutionsTotal.inc({ workflow, status });
  }
}

export default { metricsMiddleware, metricsEndpoint, setDbConnections, recordWorkflowExecution };
