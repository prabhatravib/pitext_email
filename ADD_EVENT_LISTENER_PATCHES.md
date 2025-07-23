# AddEventListener Patches for Third-Party Libraries

This document explains the solution for the `TypeError: t.addEventListener is not a function` error that occurs when third-party UI libraries try to add event listeners to null or undefined DOM elements.

## Problem

The error occurs in compiled bundles from third-party libraries like:
- `@radix-ui/react-dismissable-layer`
- `cmdk` (command palette components)

These libraries make calls like:
```javascript
t.addEventListener("animationend", d)
p.addEventListener("animationstart", p)
```

Without checking if the target (`t` or `p`) is a valid DOM element. When the target is `null` or `undefined`, this throws a `TypeError`.

## Solution

We've implemented a multi-layered approach to fix this issue:

### 1. Build-Time Patching Script

The `scripts/patch-animation-listeners.js` script automatically patches compiled bundles during the build process.

**How it works:**
- Runs after the Vite build completes
- Searches for `addEventListener` and `removeEventListener` calls
- Adds guards around them: `(target && typeof target.addEventListener === 'function' ? target.addEventListener(...) : null)`

**Integration:**
The script is automatically called in `build-with-fallback.js` after the build completes.

### 2. Patch-Package Patches

We've created patch-package patches for the specific libraries:

- `patches/@radix-ui+react-dismissable-layer+1.1.6.patch`
- `patches/cmdk+1.0.0.patch`

These patches are applied during `npm install` or `pnpm install`.

### 3. Patch Creation Script

The `scripts/create-addEventListener-patches.js` script can generate new patches for other libraries:

```bash
# Create a patch for a specific library
node scripts/create-addEventListener-patches.js @radix-ui/react-dismissable-layer@1.1.6

# Apply the patch
npx patch-package @radix-ui/react-dismissable-layer
```

## Usage

### Automatic (Recommended)

The patches are applied automatically during:
1. **Install**: patch-package patches are applied
2. **Build**: build-time script patches compiled bundles

### Manual

If you need to create patches for new libraries:

```bash
# 1. Create a patch
node scripts/create-addEventListener-patches.js library-name@version

# 2. Apply the patch
npx patch-package library-name

# 3. Commit the patch file
git add patches/
git commit -m "Add addEventListener patch for library-name"
```

### Testing

To test if the patches are working:

1. Build the application: `npm run build`
2. Check the build logs for "Animation listener patching completed"
3. Deploy and verify the error no longer occurs

## Technical Details

### Patterns Patched

The scripts look for and patch these patterns:

1. **Animation listeners:**
   ```javascript
   // Before
   t.addEventListener("animationend", d)
   p.addEventListener("animationstart", p)
   
   // After
   (t && typeof t.addEventListener === 'function' ? t.addEventListener("animationend", d) : null)
   (p && typeof p.addEventListener === 'function' ? p.addEventListener("animationstart", p) : null)
   ```

2. **Generic listeners:**
   ```javascript
   // Before
   element.addEventListener(event, handler)
   element.removeEventListener(event, handler)
   
   // After
   (element && typeof element.addEventListener === 'function' ? element.addEventListener(event, handler) : null)
   (element && typeof element.removeEventListener === 'function' ? element.removeEventListener(event, handler) : null)
   ```

### Build Integration

The patching is integrated into the build process in `build-with-fallback.js`:

```javascript
// Run the animation listener patching script
console.log('Running animation listener patching script...');
try {
  const { execSync } = await import('child_process');
  execSync('node ../../scripts/patch-animation-listeners.js build/client/assets', { stdio: 'inherit' });
  console.log('✅ Animation listener patching completed');
} catch (error) {
  console.warn('⚠️ Animation listener patching failed:', error.message);
}
```

## Troubleshooting

### Patch Not Applied

If patches aren't being applied:

1. Check that `patch-package` is installed
2. Verify patch files exist in `patches/` directory
3. Run `npx patch-package` manually

### Build Script Fails

If the build-time patching fails:

1. Check the script path in `build-with-fallback.js`
2. Verify the build output directory exists
3. Check file permissions

### Error Persists

If the error still occurs:

1. Check if new libraries were added that need patching
2. Verify the compiled bundle contains the guards
3. Look for other event listener patterns that need patching

## Maintenance

### Adding New Libraries

When adding new UI libraries that might have similar issues:

1. Test the application thoroughly
2. If errors occur, create patches using the script
3. Add the patches to version control

### Updating Libraries

When updating libraries:

1. Remove old patches: `rm patches/library-name+old-version.patch`
2. Test the new version
3. Create new patches if needed
4. Update patch-package: `npx patch-package`

## Files

- `scripts/patch-animation-listeners.js` - Build-time patching script
- `scripts/create-addEventListener-patches.js` - Patch creation utility
- `patches/` - Directory containing patch-package patches
- `build-with-fallback.js` - Build script with patching integration
- `ADD_EVENT_LISTENER_PATCHES.md` - This documentation

## Related Issues

This solution addresses:
- `TypeError: t.addEventListener is not a function`
- Animation listener errors in third-party UI libraries
- DOM element null/undefined errors in compiled bundles 