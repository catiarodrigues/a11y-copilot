import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "import"],
  categories: {
    correctness: "warn",
    suspicious: "off",
    pedantic: "off",
    style: "off",
    nursery: "off",
    restriction: "off",
  },
  env: {
    node: true,
    es2022: true,
    browser: true, // src/mcp-server/tools/simulateFixAndRescan.ts's applyPatchInBrowser runs via page.evaluate
  },
  rules: {
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        caughtErrors: "none",
        ignoreRestSiblings: true,
        vars: "all",
        varsIgnorePattern: "^_",
      },
    ],
    "import/no-duplicates": "error",
    "import/no-named-export": "off",
    "import/prefer-default-export": "off",
    "import/no-unassigned-import": "off",
    "import/consistent-type-specifier-style": "off",
    "import/group-exports": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-global-this": "off",
  },
  ignorePatterns: ["**/node_modules", "**/dist", "**/data", "**/docs", "**/*.d.ts"],
});
