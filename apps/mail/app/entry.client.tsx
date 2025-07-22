import '../instrument';

import { startTransition, StrictMode } from 'react';
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

  // Let dev tools handle router creation - NO manual RouterProvider
  hydrateRoot(
    rootElement,
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        <Root />
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
});
