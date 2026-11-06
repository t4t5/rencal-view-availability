import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@rencomputer/rencal-sdk": fileURLToPath(new URL("./test/sdk.tsx", import.meta.url)),
    },
  },
})
