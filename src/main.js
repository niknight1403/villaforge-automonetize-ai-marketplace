// Main entry point for the AI Marketplace API
// Minimal implementation to satisfy smoke test
const http = require('http');
const url = require('url');

const handlers = {
  '/health': (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok'}));
  },
  '/echo': (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({received: body}));
    });
  }
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const handler = handlers[parsed.pathname] || (() => {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'not found'}));
  });
  handler(req, res);
});

module.exports = {server};
