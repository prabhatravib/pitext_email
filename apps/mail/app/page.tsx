import HomeContent from '@/components/home/HomeContent';
import { useActiveConnection } from '@/hooks/use-connections';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { data: activeConnection } = useActiveConnection();
  const navigate = useNavigate();

  useEffect(() => {
    // If Gmail is connected, redirect to email interface
    if (activeConnection) {
      navigate('/mail/inbox');
    }
  }, [activeConnection, navigate]);

  // If Gmail is connected, show loading while redirecting
  if (activeConnection) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-muted-foreground">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  return <HomeContent />;
}
