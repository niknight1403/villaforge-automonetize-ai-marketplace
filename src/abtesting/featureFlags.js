/**
 * Lightweight Feature Flag implementation for A/B Testing.
 * Allows toggling UI variants and pricing models dynamically.
 */

const flags = {
  pricingModel: 'standard', // 'standard' | 'premium_trial'
  uiVariant: 'v1',         // 'v1' | 'v2'
};

const getFlag = (key) => {
  return flags[key] || null;
};

const setFlag = (key, value) => {
  flags[key] = value;
  console.log(`Flag ${key} updated to ${value}`);
};

module.exports = { getFlag, setFlag };