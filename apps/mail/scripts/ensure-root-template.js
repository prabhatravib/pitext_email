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

// Check if the destination already exists (built by Vite)
if (fs.existsSync(dest)) {
  console.log('Build output already exists, checking if it has the required root div...');
  const existingHtml = fs.readFileSync(dest, 'utf8');
  
  // If the built HTML already has the root div, don't overwrite it
  if (existingHtml.includes('id="root"')) {
    console.log('Built HTML already contains <div id="root"></div>, preserving Vite build output.');
    process.exit(0);
  }
}

let html = fs.readFileSync(src, 'utf8');
if (!html.includes('id="root"')) {
  console.error('index.html does not contain <div id="root"></div>!');
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, html, 'utf8');
console.log('Ensured index.html with <div id="root"></div> is in build output.');