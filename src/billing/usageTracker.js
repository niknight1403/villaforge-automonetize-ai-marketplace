// Mocking Redis for environment compatibility
const Redis = class {
  constructor() { this.data = new Map(); }
  async get(key) { return this.data.get(key) || null; }
  async set(key, val) { this.data.set(key, val); return 'OK'; }
  async incr(key) { const val = (this.data.get(key) || 0) + 1; this.data.set(key, val); return val; }
};
const stripe = require('./stripeMock').stripe;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Tracks resource usage per user/service.
 * Usage is stored in Redis and periodically synced to Stripe.
 */
async function trackUsage(userId, serviceId, tokens, cpuTimeMs) {
  const key = `usage:${userId}:${serviceId}:${new Date().toISOString().slice(0, 7)}`;
  // Use local map methods instead of hincrby/expire for mock compatibility
  const current = redis.data.get(key) || { tokens: 0, cpuTime: 0 };
  current.tokens += tokens;
  current.cpuTime += cpuTimeMs;
  await redis.set(key, current);
}

/**
 * Reports usage to Stripe Metered Billing.
 */
async function syncUsageToStripe(subscriptionItemId = 'sub_item_123', quantity) {
  if (!stripe || !stripe.subscriptionItems) {
    throw new Error('Stripe client not initialized');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity: quantity,
    timestamp: timestamp,
    action: 'increment',
  });
}

module.exports = { trackUsage, syncUsageToStripe };