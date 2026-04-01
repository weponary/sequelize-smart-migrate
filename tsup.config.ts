import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    outExtension({ format }) {
      return { js: format === "esm" ? ".mjs" : ".js" };
    },
  },
  {
    entry: { cli: "src/cli.ts" },
    format: ["cjs"],
    dts: false,
    clean: false,
    banner: { js: "#!/usr/bin/env node" },
  },
]);
