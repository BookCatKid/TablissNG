import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config} */
export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
);
