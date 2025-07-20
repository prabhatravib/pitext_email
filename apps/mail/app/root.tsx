import { type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { ClientProviders } from '@/providers/client-providers';
import { ServerProviders } from '@/providers/server-providers';
import { createTRPCClient } from '@trpc/client';
import { type AppRouter } from '@/server/trpc';
import { getLocale } from '@/locales';
import { siteConfig } from '@/config/site';
import { DubAnalytics } from '@/components/ui/dub-analytics';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { useEffect } from 'react';
import { type PropsWithChildren } from 'react';

import styles from './globals.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
];

const getUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const getServerTrpc = (req: Request) =>
  createTRPCClient<AppRouter>({
    url: `${getUrl()}/api/trpc`,
    headers: () => {
      const headers = new Headers();
      const cookie = req.headers.get('cookie');
      if (cookie) headers.set('cookie', cookie);
      return headers;
    },
  });

export const meta: MetaFunction = () => {
  return [
    { title: siteConfig.title },
    { name: 'description', content: siteConfig.description },
    { property: 'og:title', content: siteConfig.title },
    { property: 'og:description', content: siteConfig.description },
    { property: 'og:image', content: siteConfig.openGraph.images[0].url },
    { property: 'og:url', content: siteConfig.alternates.canonical },
    { property: 'og:type', content: 'website' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // For Gmail-only version, hard-code the connection ID
  return { connectionId: 'gmail' };
}

export function Layout({ children }: PropsWithChildren) {
  const { connectionId } = useLoaderData<typeof loader>();

  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />
        {import.meta.env.REACT_SCAN && (
          <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
        )}
        <Links />
      </head>
      <body className="antialiased">
        <ServerProviders connectionId={connectionId}>
          <ClientProviders>{children}</ClientProviders>
          <DubAnalytics domainsConfig={{
        refer: "mail0.com"
      }} />
        </ServerProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
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
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
    if (error.status === 404) {
      return <NotFound />;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  useEffect(() => {
    console.error(error);
    console.error({ message, details, stack });
  }, [error, message, details, stack]);

  return (
    <div className="dark:bg-background flex w-full items-center justify-center bg-white text-center">
      <div className="flex-col items-center justify-center md:flex dark:text-gray-100">
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground">See the console for more information.</p>
          <pre className="text-muted-foreground">{JSON.stringify(error, null, 2)}</pre>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-muted-foreground gap-2"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="dark:bg-background flex w-full items-center justify-center bg-white text-center">
      <div className="flex-col items-center justify-center md:flex dark:text-gray-100">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground gap-2"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
