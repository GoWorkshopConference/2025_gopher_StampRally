import { defineConfig } from 'orval';

export default defineConfig({
  gopherStampCrud: {
    input: {
      target: '../docs/swagger/gopher-stamp-crud.yml',
    },
    output: {
      target: './src/shared/api/generated/api.ts',
      client: 'react-query',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/shared/api/mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
        },
      },
    },
  },
});

