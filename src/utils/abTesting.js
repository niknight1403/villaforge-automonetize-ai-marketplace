const featureFlags = require('./featureFlags');

/**
 * Simple A/B Testing Framework
 * Allows toggling features based on user ID hashing
 */
class ABTesting {
  static isEnabled(featureKey, userId) {
    const hash = this._hash(userId);
    const threshold = featureFlags.getThreshold(featureKey) || 50;
    return (hash % 100) < threshold;
  }

  static _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

module.exports = ABTesting;