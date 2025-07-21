import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  buildDirectory: 'build/client',
  appDirectory: 'app',
  routeDiscovery: {
    mode: 'initial',
  },
  prerender: false,
  future: {
    unstable_viteEnvironmentApi: true,
  },
  serverModuleFormat: 'esm',
  // Add custom HTML template to ensure root element is present
  html: {
    template: 'index.html',
  },
} satisfies Config;
