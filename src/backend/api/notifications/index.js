/**
 * Story 7.8 — Notifications API (REST + SSE real-time)
 *
 * GET    /              — List notifications (filters: type, read, limit, offset)
 * PATCH  /:id/read      — Mark single notification as read
 * POST   /mark-all-read — Mark all unread notifications as read
 * GET    /unread-count   — Get count of unread notifications
 * GET    /stream         — SSE endpoint for real-time notifications
 * POST   /              — Create notification (internal use by workflows)
 * GET    /health         — Health check
 *
 * @version 7.8
 * @author Claude Code
 */

import { Router } from 'express';
import { directusGet, directusPost, directusPatch } from '../../lib/financeUtils.js';

const router = Router();

// SSE clients registry
const sseClients = new Set();

// ────────────────────────────────────────────────
// GET / — List notifications
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type, read, limit, offset } = req.query;

    const filters = {};
    if (type) filters['filter[type][_eq]'] = type;
    if (read === 'true') filters['filter[read_at][_nnull]'] = true;
    if (read === 'false') filters['filter[read_at][_null]'] = true;

    const notifications = await directusGet('/items/notifications', {
      ...filters,
      sort: '-date_created',
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });

    res.json({
      success: true,
      notifications: notifications || [],
      meta: {
        count: (notifications || []).length,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
      }
    });
  } catch (error) {
    console.error('[notifications] Erreur GET /:', error.message);
    res.status(500).json({ success: false, error: 'Erreur lecture notifications', details: error.message });
  }
});

// ────────────────────────────────────────────────
// PATCH /:id/read — Mark notification as read
// ────────────────────────────────────────────────
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await directusPatch(`/items/notifications/${id}`, {
      read_at: new Date().toISOString()
    });

    console.log(`[notifications] Notification ${id} marquee comme lue`);
    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('[notifications] Erreur PATCH /:id/read:', error.message);
    res.status(500).json({ success: false, error: 'Erreur marquage notification', details: error.message });
  }
});

// ────────────────────────────────────────────────
// POST /mark-all-read — Mark all unread as read
// ────────────────────────────────────────────────
router.post('/mark-all-read', async (req, res) => {
  try {
    // Fetch all unread notifications
    const unread = await directusGet('/items/notifications', {
      'filter[read_at][_null]': true,
      limit: -1,
      fields: 'id'
    });

    if (!unread || unread.length === 0) {
      return res.json({ success: true, updated: 0, message: 'Aucune notification non lue' });
    }

    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const notif of unread) {
      try {
        await directusPatch(`/items/notifications/${notif.id}`, {
          read_at: now
        });
        updatedCount++;
      } catch (patchErr) {
        console.warn(`[notifications] Erreur marquage notification ${notif.id}:`, patchErr.message);
      }
    }

    console.log(`[notifications] ${updatedCount}/${unread.length} notifications marquees comme lues`);
    res.json({ success: true, updated: updatedCount, total: unread.length });
  } catch (error) {
    console.error('[notifications] Erreur POST /mark-all-read:', error.message);
    res.status(500).json({ success: false, error: 'Erreur marquage global', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /unread-count — Get count of unread notifications
// ────────────────────────────────────────────────
router.get('/unread-count', async (req, res) => {
  try {
    const result = await directusGet('/items/notifications', {
      'filter[read_at][_null]': true,
      'aggregate[count]': 'id'
    });

    const count = parseInt(result?.[0]?.count?.id || 0);
    res.json({ success: true, count });
  } catch (error) {
    console.error('[notifications] Erreur GET /unread-count:', error.message);
    res.status(500).json({ success: false, error: 'Erreur comptage non lues', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /stream — SSE endpoint for real-time notifications
// ────────────────────────────────────────────────
router.get('/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  let lastCheckTimestamp = new Date().toISOString();

  // Poll Directus every 10 seconds for new notifications
  const pollInterval = setInterval(async () => {
    try {
      const newNotifications = await directusGet('/items/notifications', {
        'filter[date_created][_gt]': lastCheckTimestamp,
        sort: '-date_created',
        limit: 20
      });

      if (newNotifications && newNotifications.length > 0) {
        for (const notif of newNotifications) {
          res.write(`data: ${JSON.stringify({ type: 'notification', notification: notif })}\n\n`);
        }
        // Update last check timestamp to most recent notification
        lastCheckTimestamp = newNotifications[0].date_created || new Date().toISOString();
      }

      // Send heartbeat to keep connection alive
      res.write(`: heartbeat ${new Date().toISOString()}\n\n`);
    } catch (pollErr) {
      // Do not crash the SSE stream on poll errors
      console.warn('[notifications] SSE poll erreur:', pollErr.message);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Poll error' })}\n\n`);
    }
  }, 10000);

  // Track client
  const client = { res, pollInterval };
  sseClients.add(client);
  console.log(`[notifications] SSE client connecte (total: ${sseClients.size})`);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(pollInterval);
    sseClients.delete(client);
    console.log(`[notifications] SSE client deconnecte (total: ${sseClients.size})`);
  });
});

// ────────────────────────────────────────────────
// POST / — Create notification (internal use by workflows)
// ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { type, title, body, metadata, recipient, priority } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'title requis' });
    }

    const notification = await directusPost('/items/notifications', {
      type: type || 'info',
      title,
      body: body || '',
      metadata: metadata || null,
      recipient: recipient || null,
      priority: priority || 'normal',
      read_at: null
    });

    console.log(`[notifications] Notification creee: [${type || 'info'}] ${title}`);

    // Broadcast to SSE clients
    const ssePayload = JSON.stringify({ type: 'notification', notification });
    for (const client of sseClients) {
      try {
        client.res.write(`data: ${ssePayload}\n\n`);
      } catch {
        // Client may have disconnected
      }
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('[notifications] Erreur POST /:', error.message);
    res.status(500).json({ success: false, error: 'Erreur creation notification', details: error.message });
  }
});

// ────────────────────────────────────────────────
// GET /health — Health check
// ────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'notifications',
    story: '7.8',
    version: '7.8.0',
    endpoints: [
      'GET /',
      'PATCH /:id/read',
      'POST /mark-all-read',
      'GET /unread-count',
      'GET /stream (SSE)',
      'POST /',
      'GET /health'
    ],
    sse_clients: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

export default router;
