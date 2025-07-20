import { shortcutSchema } from '../../lib/shortcuts';
import { privateProcedure, router } from '../trpc';
import { z } from 'zod';

export const shortcutRouter = router({
  update: privateProcedure
    .input(
      z.object({
        shortcuts: z.array(shortcutSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // For Gmail-only version, shortcuts are not persisted
      return { success: true };
    }),
});
