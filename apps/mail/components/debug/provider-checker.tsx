import React, { createContext, useContext, useEffect } from 'react';

// Create contexts to track provider usage
const CommandPaletteContext = createContext<boolean>(false);
const HotkeyProviderContext = createContext<boolean>(false);

// Hook to check if we're in development mode
const useIsDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Provider checker component
export function ProviderChecker({ children }: { children: React.ReactNode }) {
  const isDev = useIsDevelopment();
  
  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <CommandPaletteContext.Provider value={true}>
      <HotkeyProviderContext.Provider value={true}>
        {children}
      </HotkeyProviderContext.Provider>
    </CommandPaletteContext.Provider>
  );
}

// Hook to validate provider usage
export function useProviderValidation() {
  const isDev = useIsDevelopment();
  const hasCommandPalette = useContext(CommandPaletteContext);
  const hasHotkeyProvider = useContext(HotkeyProviderContext);

  useEffect(() => {
    if (!isDev) return;

    // Check for missing providers
    if (!hasCommandPalette) {
      console.warn('⚠️ useCommandPalette is being used outside CommandPaletteProvider');
    }
    
    if (!hasHotkeyProvider) {
      console.warn('⚠️ Hotkey components are being used outside HotkeyProviderWrapper');
    }
  }, [isDev, hasCommandPalette, hasHotkeyProvider]);

  return { hasCommandPalette, hasHotkeyProvider };
}

// Enhanced useCommandPalette with validation
export function useCommandPaletteWithValidation() {
  const isDev = useIsDevelopment();
  const hasCommandPalette = useContext(CommandPaletteContext);
  
  if (isDev && !hasCommandPalette) {
    console.error('❌ useCommandPalette must be used within a CommandPaletteProvider');
  }
  
  // Import the real useCommandPalette
  const { useCommandPalette } = require('../context/command-palette-context');
  return useCommandPalette();
} 