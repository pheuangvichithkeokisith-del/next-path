import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-frontend workspaces are validated by their own tooling. Ignoring
    // them here keeps the Next.js lint command focused and avoids traversing
    // the backend virtual environment.
    "backend/**",
    ".agents/**",
    ".codex/**",
    "docs/**",
    "scripts/**",
    "snapshots/**",
    "v4.0/**",
    "design-system/**",
    "data/**",
  ]),
]);

export default eslintConfig;
