import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';

// Default labels for Gmail-only version
const defaultLabels = [
  { name: 'Work', usecase: 'Work-related emails' },
  { name: 'Personal', usecase: 'Personal emails' },
  { name: 'Finance', usecase: 'Financial emails' },
  { name: 'Travel', usecase: 'Travel-related emails' },
  { name: 'Shopping', usecase: 'Shopping and receipts' },
];

export const brainRouter = router({
  getLabels: publicProcedure.query(() => {
    // Return default labels for Gmail-only version
    return defaultLabels;
  }),

  getState: publicProcedure.query(() => {
    // Return default brain state (disabled for Gmail-only version)
    return {
      enabled: false,
      labels: defaultLabels,
    };
  }),

  updateLabels: privateProcedure
    .input(z.object({
      labels: z.array(z.object({
        name: z.string(),
        usecase: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      // For Gmail-only version, just return success
      // Labels are not persisted in this version
      return { success: true };
    }),

  enableBrain: privateProcedure.mutation(async () => {
    // For Gmail-only version, brain functionality is disabled
    return { success: true };
  }),

  disableBrain: privateProcedure.mutation(async () => {
    // For Gmail-only version, brain functionality is disabled
    return { success: true };
  }),
});
