import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
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
  serverMinify: false,
  // Disable SSR build completely
  build: {
    ssr: false,
  },
  // Ensure client-side routing works properly
  clientEntry: 'app/entry.client.tsx',
  // Disable server-side features
  serverEntry: undefined,
} satisfies Config;
