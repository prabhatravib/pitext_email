import { useKeyboardLayout } from '@/components/keyboard-layout-indicator';
import { LoadingProvider } from '@/components/context/loading-context';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PostHogProvider } from '@/lib/posthog-provider';
import { useSettings } from '@/hooks/use-settings';
import { Provider as JotaiProvider } from 'jotai';
import type { PropsWithChildren } from 'react';
import Toaster from '@/components/ui/toast';
import { ThemeProvider } from 'next-themes';

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
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        enableSystem
        disableTransitionOnChange
        defaultTheme={theme}
      >
        {children}
      </ThemeProvider>
    </NuqsAdapter>
  );
}

// Legacy export for backward compatibility
export function ClientProviders({ children }: PropsWithChildren) {
  return <BaseProviders>{children}</BaseProviders>;
}
