const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const apiLatency = new client.Histogram({
  name: 'ai_marketplace_api_latency_seconds',
  help: 'API latency in seconds',
  labelNames: ['endpoint'],
  registers: [register]
});

const agentAutonomyRate = new client.Gauge({
  name: 'ai_marketplace_agent_autonomy_rate',
  help: 'Percentage of autonomous agent tasks',
  registers: [register]
});

const billingEvents = new client.Counter({
  name: 'ai_marketplace_billing_events_total',
  help: 'Total billing events processed',
  labelNames: ['status'],
  registers: [register]
});

module.exports = { register, apiLatency, agentAutonomyRate, billingEvents };