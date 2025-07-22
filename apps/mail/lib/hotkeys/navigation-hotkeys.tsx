import { enhancedKeyboardShortcuts } from '@/config/shortcuts';
import { useShortcuts } from './use-hotkey-utils';
import { useNavigate } from 'react-router-dom';

export function NavigationHotkeys() {
  const navigate = useNavigate();
  const scope = 'navigation';

  const handlers = {
    goToDrafts: () => navigate('/mail/draft'),
    inbox: () => navigate('/mail/inbox'),
    sentMail: () => navigate('/mail/sent'),
    goToArchive: () => navigate('/mail/archive'),
    goToBin: () => navigate('/mail/bin'),
    goToSettings: () => navigate('/settings'),
    helpWithShortcuts: () => navigate('/settings/shortcuts'),
  };

  const globalShortcuts = enhancedKeyboardShortcuts.filter((shortcut) => shortcut.scope === scope);

  useShortcuts(globalShortcuts, handlers, { scope });

  return null;
}
