/**
 * Simple Feature Flag Service for A/B Testing
 * Allows toggling UI variants and pricing models dynamically.
 */

const flags = {
  enableNewPricingModel: process.env.ENABLE_NEW_PRICING === 'true',
  uiVariant: process.env.UI_VARIANT || 'default',
};

const getFlag = (key) => {
  return flags[key];
};

module.exports = { getFlag };
