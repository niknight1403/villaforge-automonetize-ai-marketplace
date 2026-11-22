const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const apiLatency = new client.Histogram({
  name: 'ai_marketplace_api_latency_seconds',
  help: 'API latency in seconds',
  labelNames: ['endpoint']
});

const agentAutonomyRate = new client.Gauge({
  name: 'ai_marketplace_agent_autonomy_rate',
  help: 'Percentage of autonomous agent actions'
});

const billingEvents = new client.Counter({
  name: 'ai_marketplace_billing_events_total',
  help: 'Total billing events processed',
  labelNames: ['status']
});

module.exports = { client, apiLatency, agentAutonomyRate, billingEvents };