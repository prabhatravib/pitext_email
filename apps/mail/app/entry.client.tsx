import '../instrument';

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router';

// Import the root component
import Root from './root';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// In production, we need to create a data router explicitly
// In development, React Router dev tools handle this automatically
const router = !isDevelopment ? createBrowserRouter([
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

  // Use different approaches for dev and production
  hydrateRoot(
    rootElement,
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        {isDevelopment ? (
          // In development, let dev tools handle router creation
          <Root />
        ) : (
          // In production, use RouterProvider to ensure data router functionality
          <RouterProvider router={router!} />
        )}
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
});
