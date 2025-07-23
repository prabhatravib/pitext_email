import './init-paraglide'; // Initialize Paraglide before anything else
import '../instrument';

import { startTransition, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { createBrowserRouter, RouterProvider, useParams, useSearchParams, useNavigate } from 'react-router-dom';

// Import the root component and page components
import Root from './root';
import HomePage from './home/page';
import AboutPage from './(full-width)/about';
import TermsPage from './(full-width)/terms';
import PricingPage from './(full-width)/pricing';
import PrivacyPage from './(full-width)/privacy';
import ContributorsPage from './(full-width)/contributors';
import HrPage from './(full-width)/hr';
import LoginPage from './(auth)/login/page';
import DeveloperPage from './(routes)/developer/page';
import MailPage from './(routes)/mail/page';
import MailCreatePage from './(routes)/mail/create/page';
import MailComposePage from './(routes)/mail/compose/page';
import MailUnderConstructionPage from './(routes)/mail/under-construction/[path]/page';
import MailFolderPage from './(routes)/mail/[folder]/page';
import SettingsPage from './(routes)/settings/page';
import SettingsAppearancePage from './(routes)/settings/appearance/page';
import SettingsConnectionsPage from './(routes)/settings/connections/page';
import SettingsDangerZonePage from './(routes)/settings/danger-zone/page';
import SettingsGeneralPage from './(routes)/settings/general/page';
import SettingsLabelsPage from './(routes)/settings/labels/page';
import SettingsNotificationsPage from './(routes)/settings/notifications/page';
import SettingsPrivacyPage from './(routes)/settings/privacy/page';
import SettingsSecurityPage from './(routes)/settings/security/page';
import SettingsShortcutsPage from './(routes)/settings/shortcuts/page';
import SettingsCatchAllPage from './(routes)/settings/[...settings]/page';
import NotFoundPage from './meta-files/not-found';

// Wrapper component for UnderConstructionPage to handle params
function UnderConstructionWrapper() {
  const params = useParams();
  return <MailUnderConstructionPage params={Promise.resolve({ path: params.path || '' })} />;
}

// Error boundary component for React Router
function RouterErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary 
      fallback={({ error, resetError }) => (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="text-muted-foreground text-center max-w-md">
              An error occurred while loading this page. This might be due to a temporary issue.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload Page
              </button>
              <button 
                onClick={resetError} 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                  {error?.message || 'Unknown error'}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Create browser router with proper routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'terms',
        element: <TermsPage />
      },
      {
        path: 'pricing',
        element: <PricingPage />
      },
      {
        path: 'privacy',
        element: <PrivacyPage />
      },
      {
        path: 'contributors',
        element: <ContributorsPage />
      },
      {
        path: 'hr',
        element: <HrPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'developer',
        element: <DeveloperPage />
      },
      {
        path: 'mail',
        element: <MailPage />
      },
      {
        path: 'mail/create',
        element: <MailCreatePage />
      },
      {
        path: 'mail/compose',
        element: <MailComposePage />
      },
      {
        path: 'mail/under-construction/:path',
        element: <UnderConstructionWrapper />
      },
      {
        path: 'mail/:folder',
        element: <MailFolderPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'settings/appearance',
        element: <SettingsAppearancePage />
      },
      {
        path: 'settings/connections',
        element: <SettingsConnectionsPage />
      },
      {
        path: 'settings/danger-zone',
        element: <SettingsDangerZonePage />
      },
      {
        path: 'settings/general',
        element: <SettingsGeneralPage />
      },
      {
        path: 'settings/labels',
        element: <SettingsLabelsPage />
      },
      {
        path: 'settings/notifications',
        element: <SettingsNotificationsPage />
      },
      {
        path: 'settings/privacy',
        element: <SettingsPrivacyPage />
      },
      {
        path: 'settings/security',
        element: <SettingsSecurityPage />
      },
      {
        path: 'settings/shortcuts',
        element: <SettingsShortcutsPage />
      },
      {
        path: 'settings/*',
        element: <SettingsCatchAllPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

startTransition(() => {
  let rootElement = document.getElementById('root');
  
  // If root element doesn't exist, create it
  if (!rootElement) {
    console.warn('Root element not found, creating it dynamically');
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    
    // If there's no body, create it too
    if (!document.body) {
      const body = document.createElement('body');
      body.className = 'antialiased';
      document.documentElement.appendChild(body);
    }
    
    document.body.appendChild(rootElement);
  }

  // Ensure the root element is properly positioned
  if (!rootElement.parentElement) {
    document.body.appendChild(rootElement);
  }

  // Use createRoot for client-side only rendering
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterErrorBoundary>
        <RouterProvider router={router} />
      </RouterErrorBoundary>
    </StrictMode>
  );
});
