import { createAuthClient } from 'better-auth/client';
import { type Account } from 'better-auth';

const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export const authClient = createAuthClient<Account>({
  baseURL: backendUrl,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    // Removed phoneNumberClient - no SMS authentication
  ],
});

export const { signIn, signUp, signOut, useSession, getSession, $fetch } = authClient;
export type Session = Awaited<ReturnType<typeof authClient.api.getSession>>;
