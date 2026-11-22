const { apiLatency } = require('./prometheusConfig');

function metricsMiddleware(req, res, next) {
  const end = apiLatency.startTimer({ endpoint: req.path });
  res.on('finish', () => {
    end();
  });
  next();
}

module.exports = metricsMiddleware;