import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';

// Demo connection for testing without OAuth
const demoConnection = {
  id: 'demo-connection',
  providerId: 'google' as const,
  email: 'demo@gmail.com',
  name: 'Demo User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useConnections = () => {
  const trpc = useTRPC();
  const connectionsQuery = useQuery(trpc.connections.list.queryOptions());
  return connectionsQuery;
};

export function useActiveConnection() {
  const trpc = useTRPC();

  const connectionQuery = useQuery(
    trpc.connections.getDefault.queryOptions(void 0, {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    }),
  );

  // Return demo connection if no real connection exists
  if (!connectionQuery.data) {
    return {
      data: demoConnection,
      isLoading: false,
      error: null,
    };
  }

  return connectionQuery;
}
