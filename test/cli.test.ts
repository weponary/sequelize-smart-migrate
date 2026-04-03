import { afterEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => {
  const run = vi.fn();

  return {
    run,
    MigrationCli: vi.fn(function MockMigrationCli(this: { run: typeof run }) {
      this.run = run;
    }),
    CliArgsParser: vi.fn(function MockCliArgsParser() {}),
    MigrationCommandParser: vi.fn(function MockMigrationCommandParser() {}),
    SequelizeMigrationGenerator: vi.fn(function MockSequelizeMigrationGenerator() {}),
    SequelizeTypeResolver: vi.fn(function MockSequelizeTypeResolver() {}),
    MigrationPathResolver: vi.fn(function MockMigrationPathResolver() {}),
  };
});

vi.mock("../src/core/cli/migration-cli", () => ({
  MigrationCli: mocked.MigrationCli,
}));

vi.mock("../src/core/parsers/cli-args-parser", () => ({
  CliArgsParser: mocked.CliArgsParser,
}));

vi.mock("../src/core/parsers/migration-command-parser", () => ({
  MigrationCommandParser: mocked.MigrationCommandParser,
}));

vi.mock("../src/core/path/migration-path-resolver", () => ({
  MigrationPathResolver: mocked.MigrationPathResolver,
}));

vi.mock("../src/orms/sequelize/sequelize-migration-generator", () => ({
  SequelizeMigrationGenerator: mocked.SequelizeMigrationGenerator,
}));

vi.mock("../src/orms/sequelize/sequelize-type-resolver", () => ({
  SequelizeTypeResolver: mocked.SequelizeTypeResolver,
}));

describe("cli entrypoint", () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("builds CLI dependencies and runs with process argv", async () => {
    const argv = ["node", "cli.js", "create", "add-email-to-users", "email:string"];
    process.argv = argv;

    await import("../src/cli");

    expect(mocked.CliArgsParser).toHaveBeenCalledTimes(1);
    expect(mocked.MigrationCommandParser).toHaveBeenCalledTimes(1);
    expect(mocked.SequelizeTypeResolver).toHaveBeenCalledTimes(1);
    expect(mocked.SequelizeMigrationGenerator).toHaveBeenCalledTimes(1);
    expect(mocked.MigrationPathResolver).toHaveBeenCalledTimes(1);
    expect(mocked.MigrationCli).toHaveBeenCalledTimes(1);
    expect(mocked.run).toHaveBeenCalledWith(argv);
  });
});
