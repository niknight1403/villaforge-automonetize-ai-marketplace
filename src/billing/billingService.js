const { syncUsageToStripe } = require('./usageTracker');

/**
 * Orchestrates billing logic, including threshold alerts.
 */
async function processBillingCycle(userId, subscriptionItemId, totalUsage) {
  const THRESHOLD = 100000; // Example threshold
  
  if (totalUsage > THRESHOLD) {
    console.warn(`Alert: User ${userId} exceeded usage threshold.`);
    // Integration for email notification would go here
  }

  try {
    await syncUsageToStripe(subscriptionItemId, totalUsage);
    return { success: true };
  } catch (error) {
    console.error('Stripe Sync Failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { processBillingCycle };