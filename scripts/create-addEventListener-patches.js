#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to create patch-package patches for libraries with addEventListener issues
 * This generates proper patch files that can be applied during npm install
 */

const PATCHES_DIR = path.resolve(__dirname, '../patches');

function createPatchForLibrary(libraryName, version, sourceDir) {
  const patchFileName = `${libraryName}+${version}.patch`;
  const patchPath = path.join(PATCHES_DIR, patchFileName);
  
  console.log(`Creating patch for ${libraryName}@${version}...`);
  
  // Find the main distribution file
  const possibleFiles = [
    'dist/index.mjs',
    'dist/index.js',
    'index.mjs',
    'index.js'
  ];
  
  let sourceFile = null;
  for (const file of possibleFiles) {
    const fullPath = path.join(sourceDir, file);
    if (fs.existsSync(fullPath)) {
      sourceFile = file;
      break;
    }
  }
  
  if (!sourceFile) {
    console.warn(`⚠️ No source file found for ${libraryName}`);
    return false;
  }
  
  const sourceFilePath = path.join(sourceDir, sourceFile);
  let content = fs.readFileSync(sourceFilePath, 'utf8');
  
  // Create a backup of the original content
  const originalContent = content;
  
  // Apply the addEventListener guards
  let modified = false;
  
  // Pattern 1: t.addEventListener("animationend", d)
  const animationEndPattern = /(\w+)\.addEventListener\("animationend",\s*(\w+)\)/g;
  content = content.replace(animationEndPattern, (match, target, handler) => {
    modified = true;
    return `(${target} && typeof ${target}.addEventListener === 'function' ? ${target}.addEventListener("animationend", ${handler}) : null)`;
  });

  // Pattern 2: p.addEventListener("animationstart", p)
  const animationStartPattern = /(\w+)\.addEventListener\("animationstart",\s*(\w+)\)/g;
  content = content.replace(animationStartPattern, (match, target, handler) => {
    modified = true;
    return `(${target} && typeof ${target}.addEventListener === 'function' ? ${target}.addEventListener("animationstart", ${handler}) : null)`;
  });

  // Pattern 3: Generic addEventListener calls (fallback)
  const genericAddEventListenerPattern = /(\w+)\.addEventListener\(/g;
  content = content.replace(genericAddEventListenerPattern, (match, target) => {
    // Skip if already patched
    if (match.includes('typeof')) return match;
    modified = true;
    return `(${target} && typeof ${target}.addEventListener === 'function' ? ${target}.addEventListener(`;
  });

  // Pattern 4: Generic removeEventListener calls
  const genericRemoveEventListenerPattern = /(\w+)\.removeEventListener\(/g;
  content = content.replace(genericRemoveEventListenerPattern, (match, target) => {
    // Skip if already patched
    if (match.includes('typeof')) return match;
    modified = true;
    return `(${target} && typeof ${target}.removeEventListener === 'function' ? ${target}.removeEventListener(`;
  });

  // Close any unclosed conditional expressions from generic patterns
  if (modified) {
    // Close addEventListener conditionals
    content = content.replace(/\.addEventListener\(([^)]+)\)(?!\s*:)/g, (match, args) => {
      return `.addEventListener(${args}) : null)`;
    });
    
    // Close removeEventListener conditionals
    content = content.replace(/\.removeEventListener\(([^)]+)\)(?!\s*:)/g, (match, args) => {
      return `.removeEventListener(${args}) : null)`;
    });
  }
  
  if (!modified) {
    console.log(`ℹ️ No addEventListener calls found in ${libraryName}`);
    return false;
  }
  
  // Create the patch file
  const patchContent = `diff --git a/${sourceFile} b/${sourceFile}
index 1234567890abcdef..abcdef1234567890 100644
--- a/${sourceFile}
+++ b/${sourceFile}
@@ -1,1 +1,1 @@
-${originalContent}
+${content}
`;
  
  fs.writeFileSync(patchPath, patchContent);
  console.log(`✅ Created patch: ${patchFileName}`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node create-addEventListener-patches.js <library-name>@<version> [source-dir]');
    console.log('Example: node create-addEventListener-patches.js @radix-ui/react-dismissable-layer@1.1.6 node_modules/@radix-ui/react-dismissable-layer');
    process.exit(1);
  }
  
  const [librarySpec, sourceDir] = args;
  const [libraryName, version] = librarySpec.split('@');
  
  if (!libraryName || !version) {
    console.error('Invalid library specification. Use format: library-name@version');
    process.exit(1);
  }
  
  const actualSourceDir = sourceDir || path.join('node_modules', libraryName);
  
  if (!fs.existsSync(actualSourceDir)) {
    console.error(`Source directory not found: ${actualSourceDir}`);
    process.exit(1);
  }
  
  // Ensure patches directory exists
  if (!fs.existsSync(PATCHES_DIR)) {
    fs.mkdirSync(PATCHES_DIR, { recursive: true });
  }
  
  const success = createPatchForLibrary(libraryName, version, actualSourceDir);
  
  if (success) {
    console.log(`\n✅ Patch created successfully!`);
    console.log(`📝 To apply the patch, run: npx patch-package ${libraryName}`);
  } else {
    console.log(`\n⚠️ No changes were made. The library may not need patching.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createPatchForLibrary }; 