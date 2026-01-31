import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Keep ESLint from scanning build artifacts across workspaces.
  globalIgnores([
    "**/dist/**",
    "**/.turbo/**",
  ]),
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Non-Next packages/services don't have a pages directory; disable this Next-specific rule.
  {
    files: ["services/**/*.{js,jsx,ts,tsx}", "packages/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // Web app is still mid-migration; keep lint signal useful by avoiding noisy rules.
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
