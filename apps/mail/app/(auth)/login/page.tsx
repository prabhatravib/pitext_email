import { LoginClient } from './login-client';
import { useEffect, useState } from 'react';

export async function clientLoader() {
  const isProd = !import.meta.env.DEV;
  const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(backendUrl + '/api/public/providers');
  const data = (await response.json()) as { allProviders: any[] };

  return {
    allProviders: data.allProviders,
    isProd,
  };
}

export default function LoginPage() {
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [isProd, setIsProd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const isProdEnv = !import.meta.env.DEV;
        setIsProd(isProdEnv);
        
        const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const response = await fetch(backendUrl + '/api/public/providers');
        const data = (await response.json()) as { allProviders: any[] };
        
        setAllProviders(data.allProviders || []);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        setAllProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-black">
      <LoginClient providers={allProviders} isProd={isProd} />
    </div>
  );
}
