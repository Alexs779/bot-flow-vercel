import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
    setupFiles: [],
    coverage: {
      enabled: false,
    },
  },
})
