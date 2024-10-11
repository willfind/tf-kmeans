import globals from "globals"
import pluginJs from "@eslint/js"

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        afterAll: "readonly",
        beforeAll: "readonly",
        expect: "readonly",
        test: "readonly",
      },
    },

    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
  pluginJs.configs.recommended,
]
