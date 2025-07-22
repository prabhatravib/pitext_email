import { redirect } from 'react-router';

export async function clientLoader() {
  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return redirect(`${appUrl}/mail/inbox`);
}
