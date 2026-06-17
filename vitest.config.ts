import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Map the `@/*` import alias from tsconfig.json so tests resolve modules the
// same way the app does. (Set manually rather than via a plugin to keep the
// config loadable by Vitest's CommonJS config loader.)
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "next-scaffold"],
  },
});
