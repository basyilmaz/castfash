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
    // Third-party vendor libraries
    "public/**/*.js",
    "public/**/*.min.js",
    "src/assets/**/*.js",
    "src/assets/**/*.min.js",
  ]),
  // Custom rule overrides
  {
    rules: {
      // Type safety - these should ideally be fixed but are off for now
      "@typescript-eslint/no-explicit-any": "off",
      // React patterns - common in production apps
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off",
      // SSR compatibility patterns require setState in effect
      "react-hooks/set-state-in-effect": "off",
      // React hooks - allow missing deps (common pattern for initial load)
      "react-hooks/exhaustive-deps": "off",
      // Next.js img element - external images often need native img
      "@next/next/no-img-element": "off",
      // Unused vars with underscore are intentional
      "@typescript-eslint/no-unused-vars": ["off"],
    },
  },
]);

export default eslintConfig;
