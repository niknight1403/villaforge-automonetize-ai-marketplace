import { execSync } from 'child_process';
import assert from 'assert';

// Simple smoke: start server, request health endpoint
const server = execSync('node src/server.js', {stdio: 'pipe'});
// Wait a bit
await new Promise(r=>setTimeout(r,500));
const response = await fetch('http://localhost:3000/health');
const json = await response.json();
assert.strictEqual(json.status, 'ok');
server.kill();
