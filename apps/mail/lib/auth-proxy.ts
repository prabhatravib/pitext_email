import { createAuthClient } from 'better-auth/client';

const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const authClient = createAuthClient({
  baseURL: backendUrl,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [],
});

export const authProxy = {
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      const session = await authClient.getSession({
        fetchOptions: { headers, credentials: 'include' },
      });
      if (session.error) {
        console.error(`Failed to get session: ${session.error}`, session);
        return null;
      }
      return session.data;
    },
  },
};
