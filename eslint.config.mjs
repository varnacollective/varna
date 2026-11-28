import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Stricter, type-aware rules for the List agent and list-upload code.
  {
    files: [
      "src/agents/**/*.ts",
      "src/lib/list-uploads/**/*.ts",
      "src/lib/invitations/**/*.ts",
      "src/components/ListUpload/**/*.{ts,tsx}",
      "src/app/api/superadmin/list-uploads/**/*.ts",
      "src/app/superadmin/partners/invitations/upload/**/*.tsx",
      "tests/agents/**/*.ts",
      "tests/list-uploads/**/*.ts",
      "src/lib/auth/**/*.ts",
      "src/app/api/superadmin/logins/**/*.ts",
      "src/app/superadmin/credentials/**/*.{ts,tsx}",
      "tests/auth/**/*.ts",
      "scripts/list-agent/**/*.mts",
    ],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: { project: "./tsconfig.strict.json", tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Numbers in template strings and `() => setState(x)` handlers are fine.
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
