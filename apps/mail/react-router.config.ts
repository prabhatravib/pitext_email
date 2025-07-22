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
  // Enable client-only rendering with data router support
  clientOnly: true,
  // Ensure proper data router functionality
  dataRouter: true,
} satisfies Config;
