import { defineConfig } from 'orval'

export default defineConfig({
  selfserve: {
    input: {
      target: '../../backend/docs/swagger.yaml',
      override: {
        transformer: (schema) => {
          // Clean up verbose Go package names in model definitions
          if (schema.definitions) {
            const cleanedDefinitions: any = {}
            for (const [key, value] of Object.entries(schema.definitions)) {
              // Remove the verbose Go package prefix
              const cleanKey = key.replace('github_com_generate_selfserve_internal_models.', '')
              cleanedDefinitions[cleanKey] = value
            }
            schema.definitions = cleanedDefinitions
          }
          return schema
        },
      },
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
