import fs from 'fs';
import path from 'path';

const dir = 'dist';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
fs.writeFileSync(path.join(dir, 'build.log'), 'Build successful at ' + new Date().toISOString());