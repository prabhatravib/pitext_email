#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script to verify the addEventListener patching functionality
 */

async function testPatching() {
  console.log('🧪 Testing addEventListener patching functionality...\n');

  // Test case 1: Animation end listener
  const testCase1 = 't.addEventListener("animationend", d)';
  const expected1 = '(t && typeof t.addEventListener === \'function\' ? t.addEventListener("animationend", d) : null)';
  
  // Test case 2: Animation start listener
  const testCase2 = 'p.addEventListener("animationstart", p)';
  const expected2 = '(p && typeof p.addEventListener === \'function\' ? p.addEventListener("animationstart", p) : null)';
  
  // Test case 3: Generic addEventListener
  const testCase3 = 'element.addEventListener("click", handler)';
  const expected3 = '(element && typeof element.addEventListener === \'function\' ? element.addEventListener("click", handler) : null)';
  
  // Test case 4: removeEventListener
  const testCase4 = 'element.removeEventListener("click", handler)';
  const expected4 = '(element && typeof element.removeEventListener === \'function\' ? element.removeEventListener("click", handler) : null)';

  // Apply the patching logic
  const { patchAnimationListeners } = await import('./patch-animation-listeners.js');
  
  // Create temporary test files
  const testDir = path.join(__dirname, 'test-patches');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFile = path.join(testDir, 'test.js');
  const testContent = `${testCase1};\n${testCase2};\n${testCase3};\n${testCase4};`;
  
  fs.writeFileSync(testFile, testContent);
  
  // Apply patching
  const success = patchAnimationListeners(testFile);
  
  if (success) {
    const patchedContent = fs.readFileSync(testFile, 'utf8');
    
    console.log('✅ Patching applied successfully!');
    console.log('\n📝 Original content:');
    console.log(testContent);
    console.log('\n🔧 Patched content:');
    console.log(patchedContent);
    
    // Verify the patches
    const tests = [
      { name: 'Animation end listener', pattern: /\(t && typeof t\.addEventListener === 'function' \? t\.addEventListener\("animationend", d\) : null\)/ },
      { name: 'Animation start listener', pattern: /\(p && typeof p\.addEventListener === 'function' \? p\.addEventListener\("animationstart", p\) : null\)/ },
      { name: 'Generic addEventListener', pattern: /\(element && typeof element\.addEventListener === 'function' \? element\.addEventListener\("click", handler\) : null\)/ },
      { name: 'removeEventListener', pattern: /\(element && typeof element\.removeEventListener === 'function' \? element\.removeEventListener\("click", handler\) : null\)/ }
    ];
    
    console.log('\n🔍 Verification results:');
    let allPassed = true;
    
    tests.forEach(test => {
      const passed = test.pattern.test(patchedContent);
      console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed) allPassed = false;
    });
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! The patching functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the patching logic.');
    }
  } else {
    console.log('❌ Patching failed!');
  }
  
  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Run the test
testPatching();

export { testPatching }; 