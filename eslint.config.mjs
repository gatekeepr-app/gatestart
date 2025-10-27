// eslint.config.ts (Flat Config)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Bring in Next's presets (via compat)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Make sure TS files use the TS parser and plugin
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      // (optional) if you use project-aware rules:
      // parserOptions: { projectService: true }, // TS 5+ project service
      // or: parserOptions: { project: ["./tsconfig.json"] },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: true,     // auto-fix any → unknown
          ignoreRestArgs: true,   // allow ...args: any[] in rare cases
        },
      ],
    },
  },
];
