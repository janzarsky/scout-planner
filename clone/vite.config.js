/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    include: ["src/**/*.test.js", "src/**/*.test.ts"],
  },
});
