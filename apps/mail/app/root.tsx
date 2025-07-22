import { BaseProviders } from '@/providers/client-providers';
import { ServerProviders } from '@/providers/server-providers';
import { getLocale } from '@/paraglide/runtime';
import { siteConfig } from '@/lib/site-config';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Scripts, Outlet } from 'react-router';
import { type PropsWithChildren } from 'react';

const getUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000';
};

export function Layout({ children }: PropsWithChildren) {
  return (
    <ServerProviders connectionId="gmail">
      <BaseProviders>
        {children}
        <Scripts />
      </BaseProviders>
    </ServerProviders>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">An error occurred while loading this page.</p>
        <Button onClick={handleReload}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}

function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
