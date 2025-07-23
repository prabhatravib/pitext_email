import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

export const useStats = () => {
  const { data: session, isPending } = useSession();
  const trpc = useTRPC();

  const statsQuery = useQuery(
    trpc.mail.count.queryOptions(void 0, {
      enabled: !isPending && !!session?.user?.id,
      staleTime: 1000 * 60 * 5, // 1 hour
    }),
  );

  return statsQuery;
};
