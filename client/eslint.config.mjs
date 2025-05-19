import react from "eslint-plugin-react";
import cypress from "eslint-plugin-cypress";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:cypress/recommended",
  ),
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["node_modules/*", "dist/*"],
  },
  {
    plugins: {
      react,
      cypress,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {},
  },
  {
    files: ["src/**/*.js", "src/**/*.jsx", "src/**/*.tsx", "src/**/*.ts"],

    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["cypress/**/*.js", "cypress/**/*.jsx"],
  },
];
