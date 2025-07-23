#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to patch addEventListener calls in compiled bundles
 * This adds guards around addEventListener calls to prevent TypeError when target is null/undefined
 */

function patchAddEventListenerCalls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern to match addEventListener calls without guards
    // This matches patterns like: t.addEventListener("animationend", d)
    const addEventListenerPattern = /(\w+)\.addEventListener\(/g;
    
    // Pattern to match removeEventListener calls without guards
    const removeEventListenerPattern = /(\w+)\.removeEventListener\(/g;

    // Add guards around addEventListener calls
    content = content.replace(addEventListenerPattern, (match, target) => {
      modified = true;
      return `(${target} && typeof ${target}.addEventListener === 'function' ? ${target}.addEventListener(`;
    });

    // Add guards around removeEventListener calls
    content = content.replace(removeEventListenerPattern, (match, target) => {
      modified = true;
      return `(${target} && typeof ${target}.removeEventListener === 'function' ? ${target}.removeEventListener(`;
    });

    // Close the conditional expressions
    if (modified) {
      // Find and close the conditional expressions we opened
      content = content.replace(/\.addEventListener\(([^)]+)\)/g, (match, args) => {
        return `.addEventListener(${args}) : null)`;
      });
      
      content = content.replace(/\.removeEventListener\(([^)]+)\)/g, (match, args) => {
        return `.removeEventListener(${args}) : null)`;
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Patched addEventListener calls in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error patching ${filePath}:`, error.message);
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
      if (patchAddEventListenerCalls(fullPath)) {
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

  console.log(`🔍 Searching for files to patch in: ${targetDir}`);
  const patchedCount = findAndPatchFiles(targetDir);
  
  if (patchedCount > 0) {
    console.log(`✅ Successfully patched ${patchedCount} files`);
  } else {
    console.log(`ℹ️  No files needed patching`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { patchAddEventListenerCalls, findAndPatchFiles }; 