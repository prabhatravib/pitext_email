import { useCallback, useMemo } from 'react';
import { useQueryState } from '@/lib/nuqs-replacement';

const useSearchLabels = () => {
  const [data, setData] = useQueryState('labels');

  const labels = useMemo(() => {
    return data?.split(',').map((label) => label.trim()) ?? [];
  }, [data]);

  const setLabels = useCallback(
    (labels: string[]) => {
      if (labels.length === 0) {
        setData(null);
        return;
      }
      setData(labels.join(','));
    },
    [setData],
  );

  return { labels, setLabels };
};

export default useSearchLabels;
