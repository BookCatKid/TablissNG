import eslint from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";
import formatjs from "eslint-plugin-formatjs";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

import requireOptionValueRule from "./custom-eslint-rules/require-option-value.mjs";

/** @type {import('eslint').Linter.Config} */
export default defineConfig(
  {
    ignores: ["dist/", "docs/.docusaurus/", "docs/build/", "target/"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  formatjs.configs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      local: {
        rules: {
          "require-option-value": requireOptionValueRule,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@eslint-react/no-use-context": "off",
      "@eslint-react/no-context-provider": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "local/require-option-value": "error",
    },
  },
  {
    files: [
      "rspack.config.js",
      "scripts/**/*.js",
      "eslint.config.mjs",
      "docs/sync-assets.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
