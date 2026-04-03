import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts", "test/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**", "src/orms/sequelize/migrations/*.template.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "dist/**",
        "test/**",
        "node_modules/**",
        "src/orms/sequelize/migrations/*.template.ts",
      ],
      reporter: ["text", "html", "lcov"],
    },
  },
});
