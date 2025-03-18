/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["./**/*.test.js", "./**/*.test.ts"],
  },
});
