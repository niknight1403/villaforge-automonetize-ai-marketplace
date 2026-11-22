const { getFlag } = require('./featureFlags');

/**
 * A/B Testing Manager to track conversions and user segments.
 */
class ABTestManager {
  constructor() {
    this.metrics = { v1: { conversions: 0, views: 0 }, v2: { conversions: 0, views: 0 } };
  }

  trackView(userId) {
    const variant = getFlag('uiVariant');
    this.metrics[variant].views++;
    console.log(`User ${userId} viewed variant ${variant}`);
  }

  trackConversion(userId) {
    const variant = getFlag('uiVariant');
    this.metrics[variant].conversions++;
    console.log(`User ${userId} converted on variant ${variant}`);
  }

  getReport() {
    return this.metrics;
  }
}

module.exports = new ABTestManager();