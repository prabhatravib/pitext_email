import { createAuthMiddleware, jwt, bearer, mcp } from 'better-auth/plugins';
import { type Account, betterAuth, type BetterAuthOptions } from 'better-auth';
import { getBrowserTimezone, isValidTimezone } from './timezones';
// Removed drizzleAdapter import - no longer using database
import { getSocialProviders } from './auth-providers';
import { redis } from './services';
import { getContext } from 'hono/context-storage';
// Removed database schema imports - no longer needed
import { defaultUserSettings } from './schemas';

import { disableBrainFunction } from './brain';
import { APIError } from 'better-auth/api';
// Removed getZeroDB import - no longer using database
import { type EProviders } from '../types';
import type { HonoContext } from '../ctx';
import { env } from 'cloudflare:workers';
import { createDriver } from './driver';

// Removed createDb import - no longer using database
import { dubAnalytics } from "@dub/better-auth";
import { Dub } from "dub";

// Simplified connection handler - without database operations
const connectionHandlerHook = async (account: Account) => {
  if (!account.accessToken || !account.refreshToken) {
    console.error('Missing Access/Refresh Tokens', { account });
    throw new APIError('EXPECTATION_FAILED', { message: 'Missing Access/Refresh Tokens' });
  }

  const driver = createDriver(account.providerId, {
    auth: {
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      userId: account.userId,
      email: '',
    },
  });

  const userInfo = await driver.getUserInfo().catch(() => {
    throw new APIError('UNAUTHORIZED', { message: 'Failed to get user info' });
  });

  if (!userInfo?.address) {
    console.error('Missing email in user info:', { userInfo });
    throw new APIError('BAD_REQUEST', { message: 'Missing "email" in user info' });
  }

  // Note: Connection info is no longer stored in database
  // This would need to be handled differently (e.g., in session or client-side)
  console.log('Connection established for:', userInfo.address);

  if (env.GOOGLE_S_ACCOUNT && env.GOOGLE_S_ACCOUNT !== '{}') {
    // Note: Queue functionality removed - no longer doing background sync
    console.log('Background sync disabled - using on-demand fetch');
  }
};

export const createAuth = () => {
  const dub = new Dub();

  return betterAuth({
    plugins: [
      dubAnalytics({
        dubClient: dub,
      }),
      mcp({
        loginPage: env.VITE_PUBLIC_APP_URL + '/login',
      }),
      jwt(),
      bearer(),
      // Removed phoneNumber plugin - no SMS authentication
    ],
    user: {
      deleteUser: {
        enabled: true,
        async sendDeleteAccountVerification(data) {
          const verificationUrl = data.url;

          // Removed resend() - no email service
          // await resend().emails.send({
          //   from: '0.email <no-reply@0.email>',
          //   to: data.user.email,
          //   subject: 'Delete your 0.email account',
          //   html: `
          //   <h2>Delete Your 0.email Account</h2>
          //   <p>Click the link below to delete your account:</p>
          //   <a href="${verificationUrl}">${verificationUrl}</a>
          // `,
          // });
        },
        beforeDelete: async (user, request) => {
          if (!request) throw new APIError('BAD_REQUEST', { message: 'Request object is missing' });
          const context = getContext<HonoContext>();
          try {
            // Removed context.var.autumn.customers.delete(user.id); - no database
          } catch (error) {
            console.error('Failed to delete Autumn customer:', error);
            // Continue with deletion process despite Autumn failure
          }

          // Removed connections.map(async (connection) => { ... }) - no database
          // const revokedAccounts = (
          //   await Promise.allSettled(
          //     connections.map(async (connection) => {
          //       if (!connection.accessToken || !connection.refreshToken) return false;
          //       await disableBrainFunction({
          //         id: connection.id,
          //         providerId: connection.providerId as EProviders,
          //       });
          //       const driver = createDriver(connection.providerId, {
          //         auth: {
          //           accessToken: connection.accessToken,
          //           refreshToken: connection.refreshToken,
          //           userId: user.id,
          //           email: connection.email,
          //         },
          //       });
          //       const token = connection.refreshToken;
          //       return await driver.revokeToken(token || '');
          //     }),
          //   )
          // ).map((result) => {
          //   if (result.status === 'fulfilled') {
          //     return result.value;
          //   }
          //   return false;
          // });

          // if (revokedAccounts.every((value) => !!value)) {
          //   console.log('Failed to revoke some accounts');
          // }

          // await db.deleteUser(); // No longer using database
        },
      },
    },
    databaseHooks: {
      account: {
        create: {
          after: connectionHandlerHook,
        },
        update: {
          after: connectionHandlerHook,
        },
      },
    },
    emailAndPassword: {
      enabled: false,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        // Removed resend() - no email service
        // await resend().emails.send({
        //   from: '0.email <onboarding@0.email>',
        //   to: user.email,
        //   subject: 'Reset your password',
        //   html: `
        //   <h2>Reset Your Password</h2>
        //   <p>Click the link below to reset your password:</p>
        //   <a href="${url}">${url}</a>
        //   <p>If you didn't request this, you can safely ignore this email.</p>
        // `,
        // });
      },
    },
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, token }) => {
        const verificationUrl = `${env.VITE_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&callbackURL=/settings/connections`;

        // Removed resend() - no email service
        // await resend().emails.send({
        //   from: '0.email <onboarding@0.email>',
        //   to: user.email,
        //   subject: 'Verify your 0.email account',
        //   html: `
        //   <h2>Verify Your 0.email Account</h2>
        //   <p>Click the link below to verify your email:</p>
        //   <a href="${verificationUrl}">${verificationUrl}</a>
        // `,
        // });
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        // all hooks that run on sign-up routes
        if (ctx.path.startsWith('/sign-up')) {
          // only true if this request is from a new user
          const newSession = ctx.context.newSession;
          if (newSession) {
            // Check if user already has settings
                         const context = getContext<HonoContext>();
             // Simplified: no longer checking database for existing settings
             const existingSettings = null;

            if (!existingSettings) {
              // get timezone from vercel's header
              const headerTimezone = ctx.headers?.get('x-vercel-ip-timezone');
              // validate timezone from header or fallback to browser timezone
              const timezone =
                headerTimezone && isValidTimezone(headerTimezone)
                  ? headerTimezone
                  : getBrowserTimezone();
              // write default settings against the user
                             // Note: Settings no longer stored server-side
               console.log('Default settings would be applied:', { ...defaultUserSettings, timezone });
            }
          }
        }
      }),
    },
    ...createAuthConfig(),
  });
};

const createAuthConfig = () => {
  const cache = redis();
  return {
    database: {
      // No database connection, so no database adapter
      // This section is now effectively a placeholder
      // For now, we'll just return an empty object
      // In a real scenario, you might return a mock or throw an error
      // if you were to use a database-dependent feature.
      // For this example, we'll just return an empty object.
    },
    secondaryStorage: {
      get: async (key: string) => {
        const value = await cache.get(key);
        return typeof value === 'string' ? value : value ? JSON.stringify(value) : null;
      },
      set: async (key: string, value: string, ttl?: number) => {
        if (ttl) await cache.set(key, value, { ex: ttl });
        else await cache.set(key, value);
      },
      delete: async (key: string) => {
        await cache.del(key);
      },
    },
    advanced: {
      ipAddress: {
        disableIpTracking: true,
      },
      cookiePrefix: env.NODE_ENV === 'development' ? 'better-auth-dev' : 'better-auth',
      crossSubDomainCookies: {
        enabled: true,
        domain: env.COOKIE_DOMAIN,
      },
    },
    baseURL: env.VITE_PUBLIC_BACKEND_URL,
    trustedOrigins: [
      'https://app.0.email',
      'https://sapi.0.email',
      'https://staging.0.email',
      'https://0.email',
      'http://localhost:3000',
      'https://pitext-email.onrender.com',
      'https://pitext-email-backend.onrender.com',
    ],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 3, // 1 day (every 1 day the session expiration is updated)
    },
    socialProviders: getSocialProviders(env as unknown as Record<string, string>),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: ['google'],
      },
    },
    onAPIError: {
      onError: (error) => {
        console.error('API Error', error);
      },
      errorURL: `${env.VITE_PUBLIC_APP_URL}/login`,
      throw: true,
    },
  } satisfies BetterAuthOptions;
};

export const createSimpleAuth = () => {
  return betterAuth(createAuthConfig());
};

export type Auth = ReturnType<typeof createAuth>;
export type SimpleAuth = ReturnType<typeof createSimpleAuth>;
