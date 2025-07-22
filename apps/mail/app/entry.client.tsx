import '../instrument';

import { startTransition, StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

// Import the root component
import Root from './root';

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

  // Create a browser router with the root component
  const router = createBrowserRouter([
    {
      path: '*',
      element: <Root />,
    },
  ]);

  hydrateRoot(
    rootElement,
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
    {
      onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
        console.warn('Uncaught error', error, errorInfo.componentStack);
      }),
      // Callback called when React catches an error in an ErrorBoundary.
      onCaughtError: Sentry.reactErrorHandler(),
      // Callback called when React automatically recovers from errors.
      onRecoverableError: Sentry.reactErrorHandler(),
    },
  );
});
