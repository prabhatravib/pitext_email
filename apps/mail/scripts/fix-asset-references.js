import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../build/client/client');
const assetsDir = path.join(buildDir, 'assets');
const indexPath = path.join(buildDir, 'index.html');

console.log('🔧 Fixing asset references in built HTML...');

// Read the current index.html
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Find the entry client file
const entryClientFiles = fs.readdirSync(assetsDir).filter(file => 
  file.startsWith('entry.client-') && file.endsWith('.js')
);

if (entryClientFiles.length === 0) {
  console.error('❌ No entry client file found in assets directory');
  process.exit(1);
}

const entryClientFile = entryClientFiles[0];
console.log(`📄 Found entry client file: ${entryClientFile}`);

// Replace the source reference with the built asset reference
const oldReference = '/app/entry.client.tsx';
const newReference = `/assets/${entryClientFile}`;

if (html.includes(oldReference)) {
  html = html.replace(oldReference, newReference);
  console.log(`✅ Updated asset reference: ${oldReference} → ${newReference}`);
} else {
  console.log('⚠️  No source reference found to replace');
}

// Write the updated HTML back
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Successfully updated index.html with correct asset references');