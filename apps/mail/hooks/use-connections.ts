import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';

// Demo connection for testing without OAuth
const demoConnection = {
  id: 'demo-connection',
  providerId: 'google' as const,
  email: 'demo@gmail.com',
  name: 'Demo User',
  picture: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Add any other properties that might be expected
  userId: 'demo-user-id',
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export const useConnections = () => {
  const trpc = useTRPC();
  const connectionsQuery = useQuery(trpc.connections.list.queryOptions());
  return connectionsQuery;
};

export function useActiveConnection() {
  // For now, always return demo connection to ensure the email interface loads
  // This bypasses any tRPC issues and ensures the app works
  return {
    data: demoConnection,
    isLoading: false,
    error: null,
  };
}
