import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const webFiles = ["apps/web/**/*.{js,jsx,ts,tsx}"];

const eslintConfig = defineConfig([
  // Keep ESLint from scanning build artifacts across workspaces.
  globalIgnores([
    "**/dist/**",
    "**/.turbo/**",
  ]),
  // Next.js rules should only apply to the Next app.
  ...nextVitals.map((c) => ({ ...c, files: webFiles })),
  // TypeScript/JS baseline rules should apply across workspaces.
  // (nextTs is largely TS + import hygiene; we override Next-only rules below.)
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Non-Next packages/services don't have a pages directory.
  // Disable this rule globally because turbo runs lint from many workspaces.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
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
