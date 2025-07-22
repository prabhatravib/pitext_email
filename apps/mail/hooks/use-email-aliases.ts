import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';

export function useEmailAliases() {
  const trpc = useTRPC();
  
  // For demo mode, return mock email aliases instead of making tRPC calls
  const mockAliases = {
    data: [
      { email: 'demo@gmail.com', name: 'Demo User', primary: true },
    ] as { email: string; name: string; primary?: boolean }[],
    isLoading: false,
    error: null,
  };

  // Use mock aliases for now to ensure the interface loads
  return mockAliases;
}
