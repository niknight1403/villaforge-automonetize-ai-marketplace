const Redis = require('ioredis');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Tracks resource usage per user/service.
 * Usage is stored in Redis and periodically synced to Stripe.
 */
async function trackUsage(userId, serviceId, tokens, cpuTimeMs) {
  const key = `usage:${userId}:${serviceId}:${new Date().toISOString().slice(0, 7)}`;
  await redis.hincrby(key, 'tokens', tokens);
  await redis.hincrby(key, 'cpuTime', cpuTimeMs);
  await redis.expire(key, 60 * 60 * 24 * 45); // Keep for 45 days
}

/**
 * Reports usage to Stripe Metered Billing.
 */
async function syncUsageToStripe(subscriptionItemId, quantity) {
  const timestamp = Math.floor(Date.now() / 1000);
  return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity: quantity,
    timestamp: timestamp,
    action: 'increment',
  });
}

module.exports = { trackUsage, syncUsageToStripe };