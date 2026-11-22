const fs = require('fs');
const path = require('path');

const dir = 'dist';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
fs.writeFileSync(path.join(dir, 'build.log'), 'Build successful at ' + new Date().toISOString());