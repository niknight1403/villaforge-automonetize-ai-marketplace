const prometheus = require('prom-client');

const register = new prometheus.Registry();

prometheus.collectDefaultMetrics({ register });

const apiLatency = new prometheus.Histogram({
  name: 'ai_marketplace_api_latency_seconds',
  help: 'API latency in seconds',
  labelNames: ['endpoint'],
  registers: [register]
});

const agentAutonomyRate = new prometheus.Gauge({
  name: 'ai_marketplace_agent_autonomy_rate',
  help: 'Current autonomy rate of the agent swarm',
  registers: [register]
});

const mrrCounter = new prometheus.Gauge({
  name: 'ai_marketplace_mrr_eur',
  help: 'Current Monthly Recurring Revenue in EUR',
  registers: [register]
});

module.exports = { register, apiLatency, agentAutonomyRate, mrrCounter };