import { createRateLimiterMiddleware, privateProcedure, publicProcedure, router } from '../trpc';
import { Ratelimit } from '@upstash/ratelimit';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const connectionsRouter = router({
  list: privateProcedure
    .use(
      createRateLimiterMiddleware({
        limiter: Ratelimit.slidingWindow(120, '1m'),
        generatePrefix: ({ sessionUser }) => `ratelimit:get-connections-${sessionUser?.id}`,
      }),
    )
    .query(async ({ ctx }) => {
      // For Gmail-only version, return empty connections list
      // The app will handle Gmail authentication directly
      return {
        connections: [],
        disconnectedIds: [],
      };
    }),
  setDefault: privateProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // For Gmail-only version, this is a no-op
      return { success: true };
    }),
  delete: privateProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // For Gmail-only version, this is a no-op
      return { success: true };
    }),
  getDefault: publicProcedure.query(async ({ ctx }) => {
    // For Gmail-only version, return null
    // The app will handle Gmail authentication directly
    return null;
  }),
});
