import { createRateLimiterMiddleware, publicProcedure, router } from '../trpc';
import { defaultUserSettings, userSettingsSchema, type UserSettings } from '../../lib/schemas';
import { Ratelimit } from '@upstash/ratelimit';

export const settingsRouter = router({
  get: publicProcedure
    .use(
      createRateLimiterMiddleware({
        limiter: Ratelimit.slidingWindow(120, '1m'),
        generatePrefix: ({ sessionUser }) => `ratelimit:get-settings-${sessionUser?.id}`,
      }),
    )
    .query(async ({ ctx }) => {
      // Always return default settings for Gmail-only version
      return { settings: defaultUserSettings };
    }),

  save: publicProcedure.input(userSettingsSchema.partial()).mutation(async ({ ctx, input }) => {
    // For Gmail-only version, settings are not persisted
    // Just return success to maintain API compatibility
    return { success: true };
  }),
});
