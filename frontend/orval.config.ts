import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "../docs/swagger/gopher-stamp-crud.yml",
    output: {
      target: "./src/shared/api/generated/api.ts",
      client: "react-query",
      mode: "tags-split",
      mock: false,
      override: {
        mutator: {
          path: "./src/shared/api/mutator.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});
