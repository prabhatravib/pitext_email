import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Safety check: ensure we're in a browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    try {
      const media = window.matchMedia(query);

      setMatches(media.matches);

      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Safety check: ensure addEventListener exists
      if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', listener);

        return () => {
          try {
            media.removeEventListener('change', listener);
          } catch (error) {
            console.error('Error removing media query listener:', error);
          }
        };
      } else {
        console.warn('MediaQueryList addEventListener is not available');
      }
    } catch (error) {
      console.error('Error setting up media query:', error);
    }
  }, [query]);

  return matches;
}
