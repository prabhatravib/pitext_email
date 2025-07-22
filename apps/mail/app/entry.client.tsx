import '../instrument';

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Import the root component
import Root from './root';

// Create browser router - v6 approach is much simpler
const router = createBrowserRouter([
  {
    path: '*',
    element: <Root />,
  },
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

  // Simple v6 approach - no dev tools conflicts
  hydrateRoot(
    rootElement,
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        <RouterProvider router={router} />
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
});
