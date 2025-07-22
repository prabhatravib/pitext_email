import { HotkeyProviderWrapper } from '@/components/providers/hotkey-provider-wrapper';
import { CommandPaletteProvider } from '@/components/context/command-palette-context';
import { RouterProviders } from '@/providers/client-providers';

import { Outlet } from 'react-router-dom';


export default function Layout() {
  return (
    <RouterProviders>
      <CommandPaletteProvider>
        <HotkeyProviderWrapper>
          <div className="relative flex max-h-screen w-full overflow-hidden">
            <Outlet />
          </div>
        </HotkeyProviderWrapper>
      </CommandPaletteProvider>
    </RouterProviders>
  );
}
