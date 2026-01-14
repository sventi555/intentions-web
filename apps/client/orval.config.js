import { defineConfig } from 'orval';

export default defineConfig({
  intentions: {
    input: 'http://localhost:3001/schema',
    output: {
      headers: true,
      target: './src/intentions-api.ts',
      client: 'react-query',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './orval.mutator.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
