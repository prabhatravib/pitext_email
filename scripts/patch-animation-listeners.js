#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to patch animation listener calls in compiled bundles
 * Specifically targets the patterns mentioned in the error:
 * - t.addEventListener("animationend", d)
 * - p.addEventListener("animationstart", p)
 */

function patchAnimationListeners(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
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

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Patched animation listeners in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error patching ${filePath}:`, errorMessage);
    return false;
  }
}

function findAndPatchFiles(dir, pattern = /\.(js|mjs)$/) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let patchedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      patchedCount += findAndPatchFiles(fullPath, pattern);
    } else if (pattern.test(file.name)) {
      if (patchAnimationListeners(fullPath)) {
        patchedCount++;
      }
    }
  }

  return patchedCount;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || './dist';
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory not found: ${targetDir}`);
    process.exit(1);
  }

  console.log(`🔍 Searching for animation listener patterns in: ${targetDir}`);
  const patchedCount = findAndPatchFiles(targetDir);
  
  if (patchedCount > 0) {
    console.log(`✅ Successfully patched ${patchedCount} files`);
  } else {
    console.log(`ℹ️  No files needed patching`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { patchAnimationListeners, findAndPatchFiles }; 