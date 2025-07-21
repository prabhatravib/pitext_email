import '../instrument';

import { startTransition, StrictMode } from 'react';
import { HydratedRouter } from 'react-router/dom';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

startTransition(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Clear any existing content
  rootElement.innerHTML = '';

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
