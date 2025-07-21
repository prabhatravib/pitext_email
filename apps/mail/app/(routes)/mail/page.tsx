export function clientLoader() {
  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return Response.redirect(`${appUrl}/mail/inbox`);
}
