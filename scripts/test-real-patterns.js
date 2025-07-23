#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script to verify patching works on real compiled bundle patterns
 */

async function testRealPatterns() {
  console.log('🧪 Testing patching on real compiled bundle patterns...\n');

  // Create a test file that mimics the actual compiled bundle patterns
  const testContent = `
// Simulated compiled bundle content
function someFunction() {
  var t = document.querySelector('.some-element');
  var p = document.querySelector('.another-element');
  var d = function() { console.log('animation ended'); };
  
  // These are the exact patterns from the error
  t.addEventListener("animationend", d);
  p.addEventListener("animationstart", p);
  
  // Some other patterns that might exist
  element.addEventListener("click", handler);
  target.removeEventListener("scroll", scrollHandler);
  
  // Nested patterns
  if (condition) {
    node.addEventListener("focus", focusHandler);
  }
  
  // Multiple on same line
  el1.addEventListener("mouseenter", h1), el2.addEventListener("mouseleave", h2);
}
`;

  const testDir = path.join(__dirname, 'test-real-patterns');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFile = path.join(testDir, 'compiled-bundle.js');
  fs.writeFileSync(testFile, testContent);

  console.log('📝 Original compiled bundle content:');
  console.log(testContent);
  console.log('\n' + '='.repeat(60) + '\n');

  // Apply patching
  const { patchAnimationListeners } = await import('./patch-animation-listeners.js');
  const success = patchAnimationListeners(testFile);

  if (success) {
    const patchedContent = fs.readFileSync(testFile, 'utf8');
    
    console.log('🔧 Patched compiled bundle content:');
    console.log(patchedContent);
    
    // Verify specific patterns were patched
    const patterns = [
      {
        name: 't.addEventListener("animationend", d)',
        original: /t\.addEventListener\("animationend", d\)/,
        patched: /\(t && typeof t\.addEventListener === 'function' \? t\.addEventListener\("animationend", d\) : null\)/
      },
      {
        name: 'p.addEventListener("animationstart", p)',
        original: /p\.addEventListener\("animationstart", p\)/,
        patched: /\(p && typeof p\.addEventListener === 'function' \? p\.addEventListener\("animationstart", p\) : null\)/
      },
      {
        name: 'Generic addEventListener',
        original: /element\.addEventListener\("click", handler\)/,
        patched: /\(element && typeof element\.addEventListener === 'function' \? element\.addEventListener\("click", handler\) : null\)/
      },
      {
        name: 'removeEventListener',
        original: /target\.removeEventListener\("scroll", scrollHandler\)/,
        patched: /\(target && typeof target\.removeEventListener === 'function' \? target\.removeEventListener\("scroll", scrollHandler\) : null\)/
      }
    ];

    console.log('\n🔍 Verification results:');
    let allPassed = true;

    patterns.forEach(pattern => {
      const originalFound = pattern.original.test(testContent);
      const patchedFound = pattern.patched.test(patchedContent);
      
      console.log(`${originalFound ? '✅' : '❌'} Original pattern "${pattern.name}": ${originalFound ? 'FOUND' : 'NOT FOUND'}`);
      console.log(`${patchedFound ? '✅' : '❌'} Patched pattern "${pattern.name}": ${patchedFound ? 'FOUND' : 'NOT FOUND'}`);
      
      if (!originalFound || !patchedFound) {
        allPassed = false;
      }
      console.log('');
    });

    if (allPassed) {
      console.log('🎉 All real patterns successfully patched!');
      console.log('✅ This confirms the solution will work on actual compiled bundles.');
    } else {
      console.log('⚠️ Some patterns were not patched correctly.');
    }
  } else {
    console.log('❌ Patching failed on real patterns!');
  }

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Run the test
testRealPatterns(); 