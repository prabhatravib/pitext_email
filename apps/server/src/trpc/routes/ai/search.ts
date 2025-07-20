import { GmailSearchAssistantSystemPrompt } from '../../../lib/prompts';
import { activeDriverProcedure } from '../../trpc';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { env } from 'cloudflare:workers';
import { z } from 'zod';

export const generateSearchQuery = activeDriverProcedure
  .input(z.object({ query: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const systemPrompt = GmailSearchAssistantSystemPrompt();

    const result = await generateObject({
      model: openai(env.OPENAI_MODEL || 'gpt-4o'),
      system: systemPrompt,
      prompt: input.query,
      schema: z.object({
        query: z.string(),
      }),
    });

    return result.object;
  });
