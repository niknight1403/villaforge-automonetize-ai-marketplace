const http = require('http');

async function runSmokeTest() {
  console.log('Starting Smoke Test: AI Marketplace Flow...');
  
  // Test 1: Health Check
  const health = await new Promise((resolve) => {
    http.get('http://localhost:3000/health', (res) => resolve(res.statusCode === 200));
  });
  
  // Test 2: Billing Logic Error Case
  const billing = await new Promise((resolve) => {
    http.get('http://localhost:3000/api/billing/status', (res) => resolve(res.statusCode === 401));
  });

  if (health && billing) {
    console.log('Smoke Test Passed: System operational and security guards active.');
    process.exit(0);
  } else {
    console.error('Smoke Test Failed: Critical path interrupted.');
    process.exit(1);
  }
}

runSmokeTest();