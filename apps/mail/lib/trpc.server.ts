import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@zero/server/trpc';
import superjson from 'superjson';

const getUrl = () => {
  const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || window.location.origin;
  return backendUrl + '/api/trpc';
};

export const getServerTrpc = (req: Request) =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        maxItems: 1,
        url: getUrl(),
        transformer: superjson,
        headers: req.headers,
      }),
    ],
  });
