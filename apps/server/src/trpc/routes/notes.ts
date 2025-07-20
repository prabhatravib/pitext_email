import { privateProcedure, router } from '../trpc';
import { z } from 'zod';

export const notesRouter = router({
  list: privateProcedure.input(z.object({ threadId: z.string() })).query(async ({ ctx, input }) => {
    // For Gmail-only version, return empty notes
    return { notes: [] };
  }),
  create: privateProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string(),
        color: z.string().optional().default('default'),
        isPinned: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // For Gmail-only version, notes are not persisted
      return { note: { id: 'temp', ...input } };
    }),
  update: privateProcedure
    .input(
      z.object({
        noteId: z.string(),
        data: z
          .object({
            threadId: z.string(),
            content: z.string(),
            color: z.string().optional().default('default'),
            isPinned: z.boolean().optional().default(false),
          })
          .partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // For Gmail-only version, notes are not persisted
      return { note: { id: input.noteId, ...input.data } };
    }),
  delete: privateProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // For Gmail-only version, notes are not persisted
      return { success: true };
    }),
  reorder: privateProcedure
    .input(
      z.object({
        notes: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
            isPinned: z.boolean().optional().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // For Gmail-only version, notes are not persisted
      return { success: true };
    }),
});
