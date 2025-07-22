import '../instrument';

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router';

// Import the root component
import Root from './root';

// Check if React Router dev tools are handling router creation
// This is more reliable than checking import.meta.env.DEV
const isDevToolsHandlingRouter = typeof window !== 'undefined' && 
  (window as any).__reactRouterContext !== undefined;

// Only create router if dev tools aren't handling it
const router = !isDevToolsHandlingRouter ? createBrowserRouter([
  {
    path: '*',
    element: <Root />,
  },
]) : null;

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

  // Use different approaches based on whether dev tools are active
  hydrateRoot(
    rootElement,
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        {isDevToolsHandlingRouter ? (
          // Dev tools are handling router creation
          <Root />
        ) : (
          // We need to create the router ourselves
          <RouterProvider router={router!} />
        )}
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
});
