import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../build/client');
const assetsDir = path.join(buildDir, 'assets');
const indexPath = path.join(buildDir, 'index.html');

console.log('🔧 Fixing asset references in built HTML...');
console.log('🔍 Build directory:', buildDir);
console.log('🔍 Assets directory:', assetsDir);
console.log('🔍 Index path:', indexPath);

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found at:', buildDir);
  process.exit(1);
}

// Check if assets directory exists
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Assets directory not found at:', assetsDir);
  console.log('📁 Available directories in build:');
  try {
    const buildContents = fs.readdirSync(buildDir);
    console.log(buildContents);
  } catch (e) {
    console.error('Could not read build directory:', e.message);
  }
  process.exit(1);
}

// Read the current index.html
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  console.log('📁 Available files in build directory:');
  try {
    const buildFiles = fs.readdirSync(buildDir);
    console.log(buildFiles);
  } catch (e) {
    console.error('Could not read build directory:', e.message);
  }
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
console.log('📄 Read index.html, length:', html.length);

// Find the main entry file (either entry.client or index)
const entryFiles = fs.readdirSync(assetsDir).filter(file => 
  (file.startsWith('entry.client-') || file.startsWith('index-')) && file.endsWith('.js')
);

console.log('🔍 Found entry files:', entryFiles);

if (entryFiles.length === 0) {
  console.error('❌ No entry file found in assets directory');
  console.log('📁 Available files in assets directory:');
  try {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(assetFiles);
  } catch (e) {
    console.error('Could not read assets directory:', e.message);
  }
  process.exit(1);
}

const entryFile = entryFiles[0];
console.log(`📄 Using entry file: ${entryFile}`);

// Replace the source reference with the built asset reference
const oldReference = '/app/entry.client.tsx';
const newReference = `/assets/${entryFile}`;

if (html.includes(oldReference)) {
  html = html.replace(oldReference, newReference);
  console.log(`✅ Updated asset reference: ${oldReference} → ${newReference}`);
} else {
  console.log('⚠️  No source reference found to replace');
  console.log('🔍 Checking if reference exists with different format...');
  
  // Try alternative reference formats
  const alternativeReferences = [
    'src="/app/entry.client.tsx"',
    'src=\'/app/entry.client.tsx\'',
    'src="/app/entry.client.js"',
    'src=\'/app/entry.client.js\'',
    'src="/entry.client.tsx"',
    'src=\'/entry.client.tsx\''
  ];
  
  let foundAlternative = false;
  for (const altRef of alternativeReferences) {
    if (html.includes(altRef)) {
      const newAltRef = altRef.replace(/entry\.client\.(tsx|js)/, `assets/${entryFile}`);
      html = html.replace(altRef, newAltRef);
      console.log(`✅ Updated alternative asset reference: ${altRef} → ${newAltRef}`);
      foundAlternative = true;
      break;
    }
  }
  
  if (!foundAlternative) {
    console.log('⚠️  No asset references found in HTML');
    console.log('🔍 HTML content preview:');
    console.log(html.substring(0, 500));
  }
}

// Write the updated HTML back
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Successfully updated index.html with correct asset references');

// Verify the update
const updatedHtml = fs.readFileSync(indexPath, 'utf8');
if (updatedHtml.includes(newReference)) {
  console.log('✅ Verification: Asset reference correctly updated in index.html');
} else {
  console.log('⚠️  Verification: Asset reference not found in updated HTML');
}