const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory store for demo purposes; replace with PostgreSQL pool
const services = new Map();

router.post('/', async (req, res) => {
  const { prompt, config } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const id = uuidv4();
  const service = { id, status: 'pending', prompt, config, createdAt: new Date() };
  services.set(id, service);

  // Trigger Agent Swarm logic here
  res.status(202).json({ id, status: 'pending' });
});

router.get('/:id/status', (req, res) => {
  const service = services.get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ id: service.id, status: service.status });
});

router.get('/:id/endpoint', (req, res) => {
  const service = services.get(req.params.id);
  if (!service || service.status !== 'ready') return res.status(404).json({ error: 'Endpoint not available' });
  res.json({ id: service.id, endpoint: `/api/v1/services/${service.id}/invoke` });
});

module.exports = router;