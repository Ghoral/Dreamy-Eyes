// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // 🔀 Disable TypeScript 'any' errors
      "@typescript-eslint/no-explicit-any": "off",

      // 🧹 Disable unused variable errors
      "@typescript-eslint/no-unused-vars": "off",

      // 📜 Disable unescaped JSX entities (like quotes)
      "react/no-unescaped-entities": "off",

      // 🖼️ Disable Next.js <img> warning
      "@next/next/no-img-element": "off",

      // 🎨 Disable font placement warning
      "@next/next/no-page-custom-font": "off",
    },
  },
];
