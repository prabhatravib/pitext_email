import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/settings/connections?error=' + error);
        return;
      }

      if (code) {
        try {
          // In a real implementation, you would exchange the code for tokens
          // For now, we'll simulate a successful authentication
          console.log('OAuth code received:', code);
          
          // Store demo tokens (in real app, you'd get these from Google)
          localStorage.setItem('gmail_access_token', 'demo-access-token');
          localStorage.setItem('gmail_refresh_token', 'demo-refresh-token');
          localStorage.setItem('gmail_user_email', 'demo@gmail.com');
          localStorage.setItem('gmail_user_name', 'Demo User');
          
          // Redirect to email interface
          navigate('/mail/inbox');
        } catch (err) {
          console.error('Failed to process OAuth callback:', err);
          navigate('/settings/connections?error=callback_failed');
        }
      } else {
        navigate('/settings/connections');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
} 