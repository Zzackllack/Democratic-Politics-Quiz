// Migrated to ESLint flat config format for ESLint v9+
// See: https://eslint.org/docs/latest/use/configure/configuration-files#flat-configuration-files
import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  globalIgnores([".config/*"]),
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  ...compat.extends("next", "next/core-web-vitals", "plugin:prettier/recommended"),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
  },
]);
