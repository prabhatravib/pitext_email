/**
 * Keyboard Layout Indicator Component
 * Shows the current detected keyboard layout and confidence
 */

import { keyboardLayoutMapper, type LayoutDetectionResult } from '@/utils/keyboard-layout-map';
import { KeyboardIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function KeyboardLayoutIndicator() {
  const layoutInfo = useKeyboardLayout();

  if (!layoutInfo || layoutInfo.layout === 'unknown') {
    return null;
  }

  const getLayoutDisplayName = (layout: string) => {
    const names = {
      qwerty: 'QWERTY',
      dvorak: 'Dvorak',
      colemak: 'Colemak',
      azerty: 'AZERTY',
      qwertz: 'QWERTZ',
    };
    return names[layout as keyof typeof names] || layout.toUpperCase();
  };

  return (
    <div className="text-muted-foreground flex items-center space-x-2 text-xs">
      <KeyboardIcon />
      <span>{getLayoutDisplayName(layoutInfo.layout)}</span>
    </div>
  );
}

export function useKeyboardLayout() {
  const [layoutInfo, setLayoutInfo] = useState<LayoutDetectionResult | null>(null);

  useEffect(() => {
    // Safety check: ensure we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const updateLayoutInfo = () => {
      try {
        const info = keyboardLayoutMapper.getDetectedLayout();
        setLayoutInfo(info);
        console.log('Detected keyboard layout:', info);
      } catch (error) {
        console.error('Error detecting keyboard layout:', error);
        setLayoutInfo({ layout: 'qwerty', confidence: 0.4, method: 'fallback' });
      }
    };

    updateLayoutInfo();

    const handleFocus = () => {
      setTimeout(() => {
        try {
          updateLayoutInfo();
          console.log('Window focused, updated keyboard layout');
        } catch (error) {
          console.error('Error updating keyboard layout on focus:', error);
        }
      }, 100);
    };

    // Safety check: ensure window.addEventListener exists
    if (window && typeof window.addEventListener === 'function') {
      try {
        window.addEventListener('focus', handleFocus);
        return () => {
          try {
            window.removeEventListener('focus', handleFocus);
          } catch (error) {
            console.error('Error removing focus event listener:', error);
          }
        };
      } catch (error) {
        console.error('Error adding focus event listener:', error);
      }
    } else {
      console.warn('window.addEventListener is not available');
    }
  }, []);

  return layoutInfo;
}
