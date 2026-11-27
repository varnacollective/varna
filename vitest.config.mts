import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest runs the TypeScript tests (List agent and list uploads).
// The older JavaScript tests in tests/*.test.js run with `node --test`.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Server-only modules are tested directly, outside Next.js.
      "server-only": fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
