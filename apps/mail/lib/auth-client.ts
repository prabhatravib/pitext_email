import React from 'react';

// Simple Gmail OAuth - no custom user sessions needed
// Just use Gmail's authentication and access tokens

// Gmail OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;

// Gmail OAuth scopes
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

// Check if we have Gmail access token (this is our "session")
const getGmailToken = () => {
  return localStorage.getItem('gmail_access_token');
};

// Check if user is authenticated with Gmail
const isGmailAuthenticated = () => {
  return !!getGmailToken();
};

// Get session from server
const getServerSession = async () => {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const session = await response.json();
      if (session.user) {
        // Store tokens in localStorage for client-side access
        localStorage.setItem('gmail_access_token', session.access_token || '');
        localStorage.setItem('gmail_refresh_token', session.refresh_token || '');
        localStorage.setItem('gmail_user_email', session.user.email || '');
        localStorage.setItem('gmail_user_name', session.user.name || '');
        return session;
      }
    }
  } catch (error) {
    console.error('Failed to get server session:', error);
  }
  return null;
};

// Gmail OAuth functions
export const signIn = {
  social: async ({ provider, callbackURL }: { provider: string; callbackURL: string }) => {
    if (provider === 'google') {
      // Redirect to Google OAuth
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI + '/api/auth/callback/google')}&` +
        `scope=${encodeURIComponent(GMAIL_SCOPES)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      window.location.href = authUrl;
    }
  },
};

export const signOut = async () => {
  // Clear server-side session
  try {
    await fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Failed to sign out from server:', error);
  }
  
  // Clear Gmail tokens (this ends the "session")
  localStorage.removeItem('gmail_access_token');
  localStorage.removeItem('gmail_refresh_token');
  localStorage.removeItem('gmail_user_email');
  localStorage.removeItem('gmail_user_name');
  window.location.href = '/';
};

// Simple session check - just check if we have Gmail token
export const getSession = async () => {
  // First try to get session from server
  const serverSession = await getServerSession();
  if (serverSession) {
    return serverSession;
  }

  // Fallback to client-side session
  if (isGmailAuthenticated()) {
    // User is authenticated with Gmail
    return {
      user: {
        id: 'gmail-user',
        email: localStorage.getItem('gmail_user_email') || 'user@gmail.com',
        name: localStorage.getItem('gmail_user_name') || 'Gmail User',
        image: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: 'gmail-session',
        userId: 'gmail-user',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }
  
  // No Gmail authentication
  return null;
};

// Simple useSession hook
export const useSession = () => {
  const [session, setSession] = React.useState<any>(null);
  const [isPending, setIsPending] = React.useState(true);

  React.useEffect(() => {
    const loadSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
      setIsPending(false);
    };
    loadSession();
  }, []);

  return {
    data: session,
    isPending,
    error: null,
    refetch: async () => {
      const newSession = await getSession();
      setSession(newSession);
      return newSession;
    },
  };
};

export const authClient = {
  linkSocial: async ({ provider, callbackURL }: { provider: string; callbackURL: string }) => {
    if (provider === 'google') {
      // Same as signIn.social
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI + '/auth/callback')}&` +
        `scope=${encodeURIComponent(GMAIL_SCOPES)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      window.location.href = authUrl;
    }
  },
};

export type Session = Awaited<ReturnType<typeof getSession>>;
