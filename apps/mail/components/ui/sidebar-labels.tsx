import type { Label as LabelType } from '@/types';
import { useActiveConnection } from '@/hooks/use-connections';
import { RecursiveFolder } from './recursive-folder';
import { useStats } from '@/hooks/use-stats';
import { Tree } from '../magicui/file-tree';
import { useCallback } from 'react';

type Props = {
  data: LabelType[];
};

const SidebarLabels = ({ data }: Props) => {
  const { data: stats } = useStats();
  const { data: activeAccount } = useActiveConnection();
  const getLabelCount = useCallback(
    (labelName: string | undefined): number => {
      if (!stats || !labelName) return 0;
      return (
        stats.find((stat) => stat.label?.toLowerCase() === labelName.toLowerCase())?.count ?? 0
      );
    },
    [stats],
  );

  return (
    <div className="mr-0 flex-1 pr-0">
      <div className="no-scrollbar relative -m-2 flex-1 overflow-auto bg-transparent">
        <Tree className="rounded-md bg-transparent">
          {(() => {
            if (!data) return null;
            return data?.map((label) => (
              <RecursiveFolder
                key={label.id}
                activeAccount={activeAccount}
                label={label}
                id={folder}
                handleFilterByLabel={handleFilterByLabel}
                active={!!activeLabels.find((l) => l.id === label.id)}
              />
            ));
          })()}
        </Tree>
      </div>
    </div>
  );
};

export default SidebarLabels;
