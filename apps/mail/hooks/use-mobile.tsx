import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Safety check: ensure we're in a browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };
      
      // Safety check: ensure addEventListener exists
      if (mql && typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        
        return () => {
          try {
            mql.removeEventListener('change', onChange);
          } catch (error) {
            console.error('Error removing mobile media query listener:', error);
          }
        };
      } else {
        console.warn('MediaQueryList addEventListener is not available');
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    } catch (error) {
      console.error('Error setting up mobile media query:', error);
    }
  }, []);

  return !!isMobile;
}
