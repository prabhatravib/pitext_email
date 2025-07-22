import { useTRPC } from '@/providers/query-provider';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const desiredSystemLabels = new Set([
  'IMPORTANT',
  'FORUMS',
  'PROMOTIONS',
  'SOCIAL',
  'UPDATES',
  'STARRED',
  'UNREAD',
]);

export function useLabels() {
  const trpc = useTRPC();
  
  // For demo mode, return mock labels instead of making tRPC calls
  const mockLabels = [
    {
      id: 'INBOX',
      name: 'INBOX',
      type: 'system' as const,
      color: { backgroundColor: '#1C2A41', textColor: '#D8E6FD' },
    },
    {
      id: 'STARRED',
      name: 'STARRED',
      type: 'system' as const,
      color: { backgroundColor: '#1C2A41', textColor: '#D8E6FD' },
    },
    {
      id: 'SENT',
      name: 'SENT',
      type: 'system' as const,
      color: { backgroundColor: '#1C2A41', textColor: '#D8E6FD' },
    },
  ];

  const labelQuery = {
    data: mockLabels,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };

  const { userLabels, systemLabels } = useMemo(() => {
    if (!labelQuery.data) return { userLabels: [], systemLabels: [] };
    const cleanedName = labelQuery.data
      .filter((label) => label.type === 'system')
      .map((label) => {
        return {
          ...label,
          name: label.name.replace('CATEGORY_', ''),
        };
      });
    const cleanedSystemLabels = cleanedName.filter((label) => desiredSystemLabels.has(label.name));
    return {
      userLabels: labelQuery.data.filter((label) => label.type === 'user'),
      systemLabels: cleanedSystemLabels,
    };
  }, [labelQuery.data]);

  return { userLabels, systemLabels, ...labelQuery };
}

export function useThreadLabels(ids: string[]) {
  const { userLabels: labels = [] } = useLabels();

  const threadLabels = useMemo(() => {
    if (!labels) return [];
    return labels.filter((label) => (label.id ? ids.includes(label.id) : false));
  }, [labels, ids]);

  return { labels: threadLabels };
}
