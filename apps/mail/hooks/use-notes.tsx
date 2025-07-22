import { useActiveConnection } from './use-connections';
import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';

import { m } from '@/src/paraglide/messages';
import type { Note } from '@/types';

export const useThreadNotes = (threadId: string) => {
  
  const trpc = useTRPC();
  const { data: activeConnection } = useActiveConnection();

  // For demo mode, return empty notes instead of making tRPC calls
  const mockNotes = {
    data: { notes: [] as Note[] },
    isLoading: false,
    error: null,
  };

  // Use mock notes for now to ensure the interface loads
  return mockNotes;
};
