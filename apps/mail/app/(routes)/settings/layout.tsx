import { SettingsLayoutContent } from '@/components/ui/settings-content';
import { Outlet } from 'react-router-dom';

export default function SettingsLayout() {
  return (
    <SettingsLayoutContent>
      <Outlet />
    </SettingsLayoutContent>
  );
}
