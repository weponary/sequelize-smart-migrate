import fs from "fs";
import path from "path";
import { IMigrationPathResolver } from "../common/contracts";

type SequelizeRc = {
  "migrations-path"?: string;
  paths?: {
    migrations?: string;
  };
};

export class MigrationPathResolver implements IMigrationPathResolver {
  private resolvePath(cwd: string, value: string): string {
    return path.isAbsolute(value) ? value : path.resolve(cwd, value);
  }

  private loadSequelizeRc(rcPath: string): SequelizeRc {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require(rcPath) as unknown;

    if (!loaded || typeof loaded !== "object") {
      return {};
    }

    if ("default" in loaded) {
      const def = (loaded as { default?: unknown }).default;
      if (def && typeof def === "object") {
        return def as SequelizeRc;
      }
    }

    return loaded as SequelizeRc;
  }

  public resolve(cwd: string, overridePath?: string): string {
    if (overridePath && overridePath.trim()) {
      return this.resolvePath(cwd, overridePath);
    }

    const rcPath = path.resolve(cwd, ".sequelizerc");
    if (!fs.existsSync(rcPath)) {
      return path.resolve(cwd, "migrations");
    }

    try {
      const rc = this.loadSequelizeRc(rcPath);
      const configuredPath = rc["migrations-path"] ?? rc.paths?.migrations;

      if (!configuredPath) {
        return path.resolve(cwd, "migrations");
      }

      return this.resolvePath(cwd, configuredPath);
    } catch {
      return path.resolve(cwd, "migrations");
    }
  }
}
