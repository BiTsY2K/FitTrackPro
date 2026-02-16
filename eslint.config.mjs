import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import reactNativePlugin from "eslint-plugin-react-native";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  ...compat.extends(
    "expo",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ),

  {
    plugins: {
      "react-native": reactNativePlugin,
    },

    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      "react-native/no-unused-styles": "warn",
      "react-native/no-inline-styles": "warn",

      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
