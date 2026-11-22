const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  'build': 'echo "Build complete"',
  'test': 'node --test tests/*.test.js',
  'smoke': 'node tests/smoke.test.js'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Scripts updated successfully.');