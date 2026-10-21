// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import relay from 'vite-plugin-relay';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [relay],
    server: {
      proxy: {
        // route this through nginx at /api; in dev Vite does the job.
        '/graphql': { target: 'http://localhost:8000', ws: true },
      },
    },
  },
});
