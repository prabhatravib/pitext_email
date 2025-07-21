export function clientLoader() {
  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
  return Response.redirect(`${appUrl}/mail/inbox`);
}
