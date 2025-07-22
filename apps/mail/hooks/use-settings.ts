import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

export function useSettings() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  // For demo mode, return mock settings instead of making tRPC calls
  const mockSettings = {
    data: {
      settings: {
        colorTheme: 'system',
        externalImages: false,
        trustedSenders: [],
        categories: [],
        shortcuts: {},
        notifications: true,
      },
    },
    isLoading: false,
    error: null,
  };

  // Use mock settings for now to ensure the interface loads
  return mockSettings;
}
