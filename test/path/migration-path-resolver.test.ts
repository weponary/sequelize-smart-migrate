import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { MigrationPathResolver } from "../../src/core/path/migration-path-resolver";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "smart-migrate-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("MigrationPathResolver", () => {
  it("uses override path when provided", () => {
    const resolver = new MigrationPathResolver();
    const cwd = "/repo";

    expect(resolver.resolve(cwd, "custom/migrations")).toBe(path.resolve(cwd, "custom/migrations"));
  });

  it("uses absolute override path as-is", () => {
    const resolver = new MigrationPathResolver();
    const cwd = "/repo";

    expect(resolver.resolve(cwd, "/var/tmp/migrations")).toBe("/var/tmp/migrations");
  });

  it("falls back to cwd/migrations when .sequelizerc does not exist", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "migrations"));
  });

  it("uses migrations-path from .sequelizerc when available", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(rcPath, 'module.exports = { "migrations-path": "db/migrations" };\n');

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "db/migrations"));
  });

  it("uses paths.migrations from default export in .sequelizerc", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(
      rcPath,
      'module.exports = { default: { paths: { migrations: "db/default-migrations" } } };\n',
    );

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "db/default-migrations"));
  });

  it("falls back to root export when default export exists but is not an object", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(
      rcPath,
      'module.exports = { default: "nope", "migrations-path": "db/from-root" };\n',
    );

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "db/from-root"));
  });

  it("falls back when .sequelizerc exports null", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(rcPath, "module.exports = null;\n");

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "migrations"));
  });

  it("falls back when .sequelizerc has no migrations path", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(rcPath, "module.exports = {};\n");

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "migrations"));
  });

  it("falls back when .sequelizerc cannot be loaded", () => {
    const resolver = new MigrationPathResolver();
    const cwd = makeTempDir();
    const rcPath = path.join(cwd, ".sequelizerc");

    fs.writeFileSync(rcPath, "module.exports = ;\n");

    expect(resolver.resolve(cwd)).toBe(path.resolve(cwd, "migrations"));
  });
});
