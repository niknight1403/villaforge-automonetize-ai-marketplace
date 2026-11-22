const http = require('http');

async function runSmokeTest() {
  console.log('Starting Smoke Test...');
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/health', (res) => {
      if (res.statusCode === 200) {
        console.log('Smoke Test Passed: Server is healthy.');
        resolve();
      } else {
        reject(new Error(`Smoke Test Failed: Status Code ${res.statusCode}`));
      }
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

runSmokeTest().catch(err => {
  console.error(err.message);
  process.exit(1);
});