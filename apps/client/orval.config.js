import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    input: 'http://localhost:3001/schema',
    output: {
      baseUrl: 'http://localhost:3001',
      headers: true,
      target: './src/intentions-api.ts',
      client: 'react-query',
      httpClient: 'fetch',
    },
  },
});
