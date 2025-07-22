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

  // In React Router v7 with @react-router/dev, the router is automatically created
  // We just need to render the Root component - dev tools will handle HydratedRouter
  hydrateRoot(
    rootElement,
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
        <Root />
      </Sentry.ErrorBoundary>
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
