// @ts-check

// This stuff is in the root dir instead of frontend/backend
// because emacs/flycheck expects the eslint config/executable
// to be in the root dir, and setting the config vars to make it otherwise
// is more pain than it's worth honestly

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ["**/build/**", "**/dist/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
