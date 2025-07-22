import { SettingsLayoutContent } from '@/components/ui/settings-content';
import { Outlet } from 'react-router';
import { redirect } from 'react-router';
import { authProxy } from '@/lib/auth-proxy';
import type { Route } from './+types/layout';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const session = await authProxy.api.getSession({ headers: request.headers });

    if (!session) {
      return redirect('/login');
    }
  } catch (error) {
    // In client-only mode, we'll handle auth in the component
    console.warn('Auth check failed in loader, will handle in component:', error);
  }

  return null;
}

export default function SettingsLayout() {
  return (
    <SettingsLayoutContent>
      <Outlet />
    </SettingsLayoutContent>
  );
}