import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-multiple-empty-lines": ["error", { "max": 1 }],
    },
  },
];
