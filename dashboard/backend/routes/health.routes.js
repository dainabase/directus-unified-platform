/**
 * Health Check Routes
 * Endpoints pour monitoring et health checks
 */

const express = require('express');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', async (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * GET /api/health/detailed
 * Detailed health check with service status
 */
router.get('/detailed', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {}
    };

    // Check Notion API
    try {
        const notionConfigured = !!process.env.NOTION_API_KEY;
        health.services.notion = {
            status: notionConfigured ? 'configured' : 'not_configured',
            databases: notionConfigured ? 'Check /api/notion/databases' : 'N/A'
        };
    } catch (error) {
        health.services.notion = {
            status: 'error',
            error: error.message
        };
    }

    // Check OpenAI API
    try {
        const openaiConfigured = !!process.env.OPENAI_API_KEY;
        health.services.openai = {
            status: openaiConfigured ? 'configured' : 'not_configured'
        };
    } catch (error) {
        health.services.openai = {
            status: 'error',
            error: error.message
        };
    }

    // Check file system
    try {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        await fs.access(uploadDir, fs.constants.W_OK);
        const stats = await fs.stat(uploadDir);
        
        health.services.filesystem = {
            status: 'healthy',
            uploadDir: uploadDir,
            writable: true,
            created: stats.birthtime
        };
    } catch (error) {
        health.services.filesystem = {
            status: 'error',
            error: error.message
        };
        health.status = 'degraded';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    };

    // CPU usage
    const cpuUsage = process.cpuUsage();
    health.cpu = {
        user: `${Math.round(cpuUsage.user / 1000)}ms`,
        system: `${Math.round(cpuUsage.system / 1000)}ms`
    };

    res.json(health);
});

/**
 * GET /api/health/logs
 * Get recent logs (development only)
 */
router.get('/logs', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            error: 'Logs endpoint disabled in production'
        });
    }

    try {
        const logDir = process.env.LOG_DIR || './logs';
        const logFile = path.join(logDir, 'combined.log');
        
        // Read last 50 lines of log
        const logContent = await fs.readFile(logFile, 'utf-8');
        const lines = logContent.split('\n').filter(line => line.trim());
        const recentLogs = lines.slice(-50);

        res.json({
            success: true,
            logFile,
            lineCount: recentLogs.length,
            logs: recentLogs
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to read logs',
            message: error.message
        });
    }
});

/**
 * POST /api/health/test-services
 * Test all external services
 */
router.post('/test-services', async (req, res) => {
    const tests = {
        timestamp: new Date().toISOString(),
        results: {}
    };

    // Test Notion connection
    if (process.env.NOTION_API_KEY) {
        try {
            const { Client } = require('@notionhq/client');
            const notion = new Client({ auth: process.env.NOTION_API_KEY });
            
            // Try to retrieve user info
            await notion.users.me();
            
            tests.results.notion = {
                status: 'connected',
                message: 'Successfully connected to Notion API'
            };
        } catch (error) {
            tests.results.notion = {
                status: 'error',
                message: error.message
            };
        }
    } else {
        tests.results.notion = {
            status: 'not_configured',
            message: 'NOTION_API_KEY not set'
        };
    }

    // Test OpenAI connection
    if (process.env.OPENAI_API_KEY) {
        try {
            const axios = require('axios');
            const response = await axios.get('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            
            tests.results.openai = {
                status: 'connected',
                message: 'Successfully connected to OpenAI API',
                models: response.data.data.length
            };
        } catch (error) {
            tests.results.openai = {
                status: 'error',
                message: error.response?.data?.error?.message || error.message
            };
        }
    } else {
        tests.results.openai = {
            status: 'not_configured',
            message: 'OPENAI_API_KEY not set'
        };
    }

    res.json(tests);
});

module.exports = router;