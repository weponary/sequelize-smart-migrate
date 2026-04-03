import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    target: "node18",
    dts: true,
    clean: true,
    outExtension({ format }) {
      return { js: format === "esm" ? ".mjs" : ".js" };
    },
  },
  {
    entry: { cli: "src/cli.ts" },
    format: ["cjs"],
    target: "node18",
    dts: false,
    clean: false,
    banner: { js: "#!/usr/bin/env node" },
  },
]);
