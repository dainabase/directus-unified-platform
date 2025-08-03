const Redis = require('ioredis');
const { logger } = require('./logger');

let redisClient = null;

async function initializeRedis() {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    redisClient.on('error', (err) => {
      logger.error('Erreur Redis:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connecté');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Erreur connexion Redis:', error);
    throw error;
  }
}

function getRedisClient() {
  return redisClient;
}

module.exports = { initializeRedis, getRedisClient };