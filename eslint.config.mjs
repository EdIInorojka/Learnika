import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/**",
      ".turbo/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "out/**",
      "docs/**",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
    },
  },
];
