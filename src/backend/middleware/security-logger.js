/**
 * Security Logger Middleware — HYPERVISUAL Unified Platform
 * Logs security events (auth failures, suspicious requests) via Winston
 *
 * Story 8.4 — Audit securite
 *
 * @version 1.0.0
 * @author Claude Code
 */

import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '../../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Log a security event
 *
 * @param {string} event - Event type (e.g., 'auth_failure', 'rate_limit', 'suspicious_request')
 * @param {object} details - Additional details about the event
 */
export const logSecurityEvent = (event, details) => {
  securityLogger.info({
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware to monitor and log suspicious requests
 * Logs all 401 and 403 responses with request metadata
 */
export const securityMonitor = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent('auth_failure', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
      });
    }
  });
  next();
};

export default securityMonitor;
