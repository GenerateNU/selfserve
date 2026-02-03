import { defineConfig } from 'orval'

export default defineConfig({
  selfserve: {
    input: {
      target: '../../backend/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/models',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/api/orval-mutator.ts',
          name: 'customInstance',
        },
      },
      clean: true,
    },
  },
})
