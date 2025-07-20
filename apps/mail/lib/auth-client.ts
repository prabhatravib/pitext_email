import { phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { Auth } from '@zero/server/auth';

const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || window.location.origin;

export const authClient = createAuthClient({
  baseURL: backendUrl,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [phoneNumberClient()],
});

export const { signIn, signUp, signOut, useSession, getSession, $fetch } = authClient;
export type Session = Awaited<ReturnType<Auth['api']['getSession']>>;
