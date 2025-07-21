import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, '../index.html');
const dest = path.join(__dirname, '../build/client/client/index.html');

if (!fs.existsSync(src)) {
  console.error('Source index.html not found!');
  process.exit(1);
}

let html = fs.readFileSync(src, 'utf8');
if (!html.includes('id="root"')) {
  console.error('index.html does not contain <div id="root"></div>!');
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, html, 'utf8');
console.log('Ensured index.html with <div id="root"></div> is in build output.');