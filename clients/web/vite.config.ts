import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
    },
    plugins: [
      devtools(),
      viteTsConfigPaths({
        // This is the plugin that enables path aliases
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared/src'),
      },
      // Deduplicate deps to use web app's node_modules
      dedupe: ['@tanstack/react-query', 'react', 'react-dom'],
    },
    optimizeDeps: {
      exclude: ['@shared'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [],
    },
  }
})
export default config
