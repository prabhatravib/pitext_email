import HomeContent from '@/components/home/HomeContent';
import { useActiveConnection } from '@/hooks/use-connections';
import { MailLayout } from '@/components/mail/mail';

export default function HomePage() {
  const { data: activeConnection, isLoading } = useActiveConnection();

  console.log('HomePage: activeConnection', { activeConnection, isLoading });

  // Force show email interface for now to debug the issue
  console.log('HomePage: Forcing email interface display');
  return <MailLayout />;

  // Original logic commented out for debugging
  /*
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-muted-foreground">Checking connection...</p>
        </div>
      </div>
    );
  }

  // If we have a connection (demo or real), show the email interface
  if (activeConnection) {
    console.log('HomePage: Showing email interface');
    return <MailLayout />;
  }

  // Otherwise show the home page
  console.log('HomePage: Showing home content');
  return <HomeContent />;
  */
}
