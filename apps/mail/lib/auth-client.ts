import { createAuthClient } from 'better-auth/client';
import { type Account } from 'better-auth';

const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || window.location.origin;

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
export type Session = Awaited<ReturnType<Auth['api']['getSession']>>;
