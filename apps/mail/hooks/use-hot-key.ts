import { useCallback } from 'react';

const keyStates = new Map<string, boolean>();

let listenersInit = false;

function initKeyListeners() {
  // Safety check: ensure we're in a browser environment
  if (typeof window === 'undefined' || !window.addEventListener) {
    console.warn('window.addEventListener is not available');
    return;
  }

  if (!listenersInit) {
    try {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Store the key state
        keyStates.set(e.key, true);
        
        // Also store specific states for modifier keys
        if (e.altKey) {
          keyStates.set('Alt', true);
          keyStates.set('AltLeft', true);
          keyStates.set('AltRight', true);
        }
        
        if (e.shiftKey) {
          keyStates.set('Shift', true);
          keyStates.set('ShiftLeft', true);
          keyStates.set('ShiftRight', true);
        }
        
        console.log('Key down:', e.key, 'Alt:', e.altKey, 'Shift:', e.shiftKey);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        // Clear the key state
        keyStates.set(e.key, false);
        
        // Also clear specific states for modifier keys
        if (e.key === 'Alt' || e.key === 'AltLeft' || e.key === 'AltRight') {
          keyStates.set('Alt', false);
          keyStates.set('AltLeft', false);
          keyStates.set('AltRight', false);
        }
        
        if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight') {
          keyStates.set('Shift', false);
          keyStates.set('ShiftLeft', false);
          keyStates.set('ShiftRight', false);
        }
        
        console.log('Key up:', e.key);
      };

      const handleBlur = () => {
        // Clear all key states when window loses focus
        keyStates.forEach((_, key) => {
          keyStates.set(key, false);
        });
        console.log('Window blur - all keys reset');
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('blur', handleBlur);

      listenersInit = true;
    } catch (error) {
      console.error('Error initializing key listeners:', error);
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => initKeyListeners(), 0);
}

export function useKeyState() {
  return useCallback((key: string) => keyStates.get(key) || false, []);
}
