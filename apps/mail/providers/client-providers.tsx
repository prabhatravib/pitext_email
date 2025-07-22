import { useKeyboardLayout } from '@/components/keyboard-layout-indicator';
import { LoadingProvider } from '@/components/context/loading-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PostHogProvider } from '@/lib/posthog-provider';
import { useSettings } from '@/hooks/use-settings';
import { Provider as JotaiProvider } from 'jotai';
import type { PropsWithChildren } from 'react';
import Toaster from '@/components/ui/toast';
import { ThemeProvider } from 'next-themes';
import { overwriteGetUrlOrigin } from '@/src/paraglide/runtime';

// Override Paraglide's getUrlOrigin to prevent Invalid URL errors
overwriteGetUrlOrigin(() => {
  try {
    const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    if (appUrl && appUrl !== 'undefined' && appUrl !== 'null') {
      return appUrl;
    }
    
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    
    return 'http://localhost:3000';
  } catch (error) {
    console.error('Error in getUrlOrigin:', error);
    return 'http://localhost:3000';
  }
});

// Providers that don't depend on React Router context
export function BaseProviders({ children }: PropsWithChildren) {
  useKeyboardLayout();

  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        enableSystem
        disableTransitionOnChange
        defaultTheme="system"
      >
        <SidebarProvider>
          <PostHogProvider>
            <LoadingProvider>
              {children}
              <Toaster />
            </LoadingProvider>
          </PostHogProvider>
        </SidebarProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}

// Providers that depend on React Router context
export function RouterProviders({ children }: PropsWithChildren) {
  const { data } = useSettings();
  const theme = data?.settings.colorTheme || 'system';

  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme={theme}
    >
      {children}
    </ThemeProvider>
  );
}

// Legacy export for backward compatibility
export function ClientProviders({ children }: PropsWithChildren) {
  return <BaseProviders>{children}</BaseProviders>;
}
