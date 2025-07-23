import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

export const useAttachments = (messageId: string) => {
  const { data: session, isPending } = useSession();
  const trpc = useTRPC();
  const AttachmentsQuery = useQuery(
    trpc.mail.getMessageAttachments.queryOptions(
      { messageId },
      { enabled: !isPending && !!session?.user?.id && !!messageId, staleTime: 1000 * 60 * 60 },
    ),
  );

  return AttachmentsQuery;
};
