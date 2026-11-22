// Feature flag integration using LaunchDarkly SDK
// This module exports a middleware that injects feature flag states into req.locals
// and a helper to evaluate flags in code.

const LaunchDarkly = require('launchdarkly-node-server-sdk');
const dotenv = require('dotenv');

dotenv.config();

const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY, {
  // Use a default user for server-side evaluation; in production
  // you would pass the actual user context.
  useBackgroundPolling: true,
});

// Ensure the client is ready before handling requests
const ready = new Promise((resolve, reject) => {
  ldClient.once('ready', () => resolve());
  ldClient.once('error', err => reject(err));
});

// Middleware to attach flag states to the request
async function featureFlagMiddleware(req, res, next) {
  try {
    await ready;
    const user = {
      key: req.user?.id ?? 'anonymous',
      anonymous: !req.user,
    };
    // Evaluate flags needed for the current request
    const flags = {
      uiVariant: await ldClient.variation('ui-variant', user, 'A'),
      priceModel: await ldClient.variation('price-model', user, 'starter'),
    };
    req.locals = { ...req.locals, flags };
    next();
  } catch (err) {
    console.error('LaunchDarkly error:', err);
    // Fallback to defaults
    req.locals = { ...req.locals, flags: { uiVariant: 'A', priceModel: 'starter' } };
    next();
  }
}

// Helper to evaluate a flag directly
async function isFeatureEnabled(flagKey, userContext, defaultValue) {
  await ready;
  return ldClient.variation(flagKey, userContext, defaultValue);
}

module.exports = { featureFlagMiddleware, isFeatureEnabled };
