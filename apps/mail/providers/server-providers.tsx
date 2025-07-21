import { QueryProvider } from './query-provider';
import { AutumnProvider } from 'autumn-js/react';
import type { PropsWithChildren } from 'react';

export function ServerProviders({
  children,
  connectionId,
}: PropsWithChildren<{ connectionId: string | null }>) {
  const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  return (
    <AutumnProvider backendUrl={backendUrl}>
      <QueryProvider connectionId={connectionId}>{children}</QueryProvider>
    </AutumnProvider>
  );
}
