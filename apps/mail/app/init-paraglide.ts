// Initialize Paraglide with safe URL origin handling
// This must be imported before any other Paraglide imports
import { overwriteGetUrlOrigin } from '@/src/paraglide/runtime';

// Debug environment variables
console.log('[Paraglide Init] VITE_PUBLIC_APP_URL:', import.meta.env.VITE_PUBLIC_APP_URL);
console.log('[Paraglide Init] window.location:', typeof window !== 'undefined' ? window.location : 'undefined');

// Store original URL constructor
const OriginalURL = globalThis.URL;

// Create a safe URL constructor that handles invalid origins
function SafeURL(input: string | URL, base?: string | URL) {
  try {
    // If base is provided, validate it first
    if (base) {
      let baseString: string;
      if (base instanceof URL) {
        baseString = base.href;
      } else {
        baseString = base;
      }
      
      // Check if base is invalid
      if (!baseString || 
          baseString === 'undefined' || 
          baseString === 'null' || 
          baseString === '' ||
          baseString === 'about:blank' ||
          baseString.startsWith('file://')) {
        
        console.warn('[SafeURL] Invalid base URL detected:', baseString);
        
        // Use fallback origin
        const fallbackOrigin = getSafeOrigin();
        console.log('[SafeURL] Using fallback origin:', fallbackOrigin);
        
        return new OriginalURL(input, fallbackOrigin);
      }
    }
    
    // Try normal construction
    return new OriginalURL(input, base);
  } catch (error) {
    console.error('[SafeURL] URL construction failed:', { input, base, error });
    
    // Last resort: try with fallback origin
    const fallbackOrigin = getSafeOrigin();
    console.log('[SafeURL] Using fallback origin as last resort:', fallbackOrigin);
    
    return new OriginalURL(input, fallbackOrigin);
  }
}

// Helper function to get a safe origin
function getSafeOrigin(): string {
  try {
    // First try environment variable
    const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    if (appUrl && appUrl !== 'undefined' && appUrl !== 'null' && appUrl !== '') {
      console.log('[SafeURL] Using VITE_PUBLIC_APP_URL:', appUrl);
      return appUrl;
    }
    
    // Then try window.location.origin with extra validation
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      // Check if origin is valid (not about:blank, file://, etc)
      if (origin && 
          origin !== 'undefined' && 
          origin !== 'null' && 
          origin !== '' &&
          origin !== 'about:blank' &&
          !origin.startsWith('file://') &&
          (origin.startsWith('http://') || origin.startsWith('https://'))) {
        console.log('[SafeURL] Using window.location.origin:', origin);
        return origin;
      }
      
      // Try to construct origin from window.location parts
      if (window.location.protocol && window.location.host) {
        const constructedOrigin = `${window.location.protocol}//${window.location.host}`;
        if (constructedOrigin.startsWith('http://') || constructedOrigin.startsWith('https://')) {
          console.log('[SafeURL] Using constructed origin:', constructedOrigin);
          return constructedOrigin;
        }
      }
    }
    
    // Fallback
    console.log('[SafeURL] Using fallback origin: http://localhost:3000');
    return 'http://localhost:3000';
  } catch (error) {
    console.error('[SafeURL] Error in getSafeOrigin:', error);
    return 'http://localhost:3000';
  }
}

// Override the global URL constructor immediately
if (typeof globalThis !== 'undefined') {
  globalThis.URL = SafeURL as any;
  console.log('[Paraglide Init] URL constructor overridden with SafeURL');
}

// Also override on window if available (for extra safety)
if (typeof window !== 'undefined') {
  window.URL = SafeURL as any;
  console.log('[Paraglide Init] window.URL constructor also overridden');
}

// Override Paraglide's getUrlOrigin immediately to prevent Invalid URL errors
overwriteGetUrlOrigin(() => {
  const origin = getSafeOrigin();
  console.log('[Paraglide] getUrlOrigin called, returning:', origin);
  return origin;
});

// Additional safety: override URL constructor again after a short delay
// to ensure it's not overridden by other code
setTimeout(() => {
  if (globalThis.URL !== SafeURL) {
    console.warn('[Paraglide Init] URL constructor was overridden, re-applying SafeURL');
    globalThis.URL = SafeURL as any;
  }
  if (typeof window !== 'undefined' && window.URL !== SafeURL) {
    window.URL = SafeURL as any;
  }
}, 0);

console.log('[Paraglide Init] Override complete'); 