// Initialize Paraglide with safe URL origin handling
// This must be imported before any other Paraglide imports
import { overwriteGetUrlOrigin } from '@/src/paraglide/runtime';

// Debug environment variables
console.log('[Paraglide Init] VITE_PUBLIC_APP_URL:', import.meta.env.VITE_PUBLIC_APP_URL);
console.log('[Paraglide Init] window.location:', typeof window !== 'undefined' ? window.location : 'undefined');

// Override Paraglide's getUrlOrigin immediately to prevent Invalid URL errors
overwriteGetUrlOrigin(() => {
  try {
    // First try environment variable
    const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    if (appUrl && appUrl !== 'undefined' && appUrl !== 'null' && appUrl !== '') {
      console.log('[Paraglide] Using VITE_PUBLIC_APP_URL:', appUrl);
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
        console.log('[Paraglide] Using window.location.origin:', origin);
        return origin;
      }
      
      // Try to construct origin from window.location parts
      if (window.location.protocol && window.location.host) {
        const constructedOrigin = `${window.location.protocol}//${window.location.host}`;
        if (constructedOrigin.startsWith('http://') || constructedOrigin.startsWith('https://')) {
          console.log('[Paraglide] Using constructed origin:', constructedOrigin);
          return constructedOrigin;
        }
      }
    }
    
    // Fallback
    console.log('[Paraglide] Using fallback origin: http://localhost:3000');
    return 'http://localhost:3000';
  } catch (error) {
    console.error('[Paraglide] Error in getUrlOrigin override:', error);
    return 'http://localhost:3000';
  }
});

console.log('[Paraglide Init] Override complete'); 