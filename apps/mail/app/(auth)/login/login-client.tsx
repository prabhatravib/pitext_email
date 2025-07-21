import { useNavigate } from 'react-router';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface EnvVarStatus {
  name: string;
  set: boolean;
  source: string;
  defaultValue?: string;
}

interface Provider {
  id: string;
  name: string;
  enabled: boolean;
  required?: boolean;
  envVarInfo?: EnvVarInfo[];
  envVarStatus: EnvVarStatus[];
  isCustom?: boolean;
  customRedirectPath?: string;
}

interface LoginClientProps {
  providers: Provider[];
  isProd: boolean;
}

const getProviderIcon = (providerId: string, className?: string): ReactNode => {
  const defaultClass = className || 'w-5 h-5 mr-2';

  switch (providerId) {
    case 'google':
      return <Mail className={defaultClass} />;
    default:
      return null;
  }
};

function LoginClientContent({ providers, isProd }: LoginClientProps) {
  const navigate = useNavigate();
  const [error, _] = useQueryState('error');

  const handleProviderClick = (provider: Provider) => {
    if (provider.isCustom && provider.customRedirectPath) {
      navigate(provider.customRedirectPath);
    } else {
      const callbackUrl = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
      toast.promise(
        signIn.social({
          provider: provider.id as any,
          callbackURL: `${callbackUrl}/mail`,
        }),
        {
          error: 'Login redirect failed',
        },
      );
    }
  };

  // Only show Gmail provider
  const gmailProvider = providers.find(p => p.id === 'google') || {
    id: 'google',
    name: 'Gmail',
    enabled: true,
    required: true,
    envVarStatus: [],
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Zero</CardTitle>
          <CardDescription>
            Sign in with your Gmail account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          
          <Button
            onClick={() => handleProviderClick(gmailProvider)}
            className="w-full"
            size="lg"
          >
            {getProviderIcon('google')}
            Continue with Gmail
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoginClient(props: LoginClientProps) {
  return <LoginClientContent {...props} />;
}
