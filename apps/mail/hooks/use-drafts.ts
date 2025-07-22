import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

export const useDraft = (id: string | null) => {
  const { data: session } = useSession();
  const trpc = useTRPC();
  
  // For demo mode, return null draft data instead of making tRPC calls
  const mockDraft = {
    data: null,
    isLoading: false,
    error: null,
  };

  // Use mock draft for now to ensure the interface loads
  return mockDraft;
};
