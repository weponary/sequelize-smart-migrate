import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MigrationCli } from "../../src/core/cli/migration-cli";
import {
  type ICliArgsParser,
  type ICommandParser,
  type IMigrationGenerator,
  type IMigrationPathResolver,
} from "../../src/core/common/contracts";
import { type ParsedCommand } from "../../src/core/common/parsed-command";

type MockedDeps = {
  argsParser: ICliArgsParser;
  commandParser: ICommandParser;
  generator: IMigrationGenerator;
  pathResolver: IMigrationPathResolver;
};

function createMockedDeps(): MockedDeps {
  return {
    argsParser: {
      parse: vi.fn().mockReturnValue({
        migrationPath: "db/migrations",
        migrationArgs: ["email:string"],
      }),
    },
    commandParser: {
      parse: vi.fn().mockReturnValue({
        type: "add",
        column: "email",
        table: "users",
        dataType: "STRING",
      } satisfies ParsedCommand),
    },
    generator: {
      generate: vi.fn().mockReturnValue("module.exports = {}\n"),
    },
    pathResolver: {
      resolve: vi.fn().mockReturnValue("/repo/db/migrations"),
    },
  };
}

describe("MigrationCli", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("exits with usage when action is missing", () => {
    const deps = createMockedDeps();
    const migrationCli = new MigrationCli(
      deps.argsParser,
      deps.commandParser,
      deps.generator,
      deps.pathResolver,
    );
    const exitMock = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => migrationCli.run(["node", "cli.js"])).toThrow("process.exit");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Usage: smart-migrate create <migration-name> [args...]",
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it("exits with usage when action is not create", () => {
    const deps = createMockedDeps();
    const migrationCli = new MigrationCli(
      deps.argsParser,
      deps.commandParser,
      deps.generator,
      deps.pathResolver,
    );
    const exitMock = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => migrationCli.run(["node", "cli.js", "generate", "add-email-to-users"])).toThrow(
      "process.exit",
    );
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Usage: smart-migrate create <migration-name> [args...]",
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it("prints usage and returns when help flag is passed", () => {
    const deps = createMockedDeps();
    const migrationCli = new MigrationCli(
      deps.argsParser,
      deps.commandParser,
      deps.generator,
      deps.pathResolver,
    );
    const exitMock = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const consoleLogMock = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => migrationCli.run(["node", "cli.js", "--help"])).not.toThrow();
    expect(consoleLogMock).toHaveBeenCalledOnce();
    const helpText = consoleLogMock.mock.calls[0]?.[0] as string;
    expect(helpText).toContain("Usage: smart-migrate create <migration-name> [args...]");
    expect(helpText).toContain("Supported migration-name patterns:");
    expect(helpText).toContain("Flags:");
    expect(helpText).toContain("--migration-path <path>");
    expect(helpText).toContain("-h, --help");
    expect(consoleErrorMock).not.toHaveBeenCalled();
    expect(exitMock).not.toHaveBeenCalled();
  });

  it("creates migration file and logs relative path on success", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T03:04:05.678Z"));

    const deps = createMockedDeps();
    const migrationCli = new MigrationCli(
      deps.argsParser,
      deps.commandParser,
      deps.generator,
      deps.pathResolver,
    );
    const cwdMock = vi.spyOn(process, "cwd").mockReturnValue("/repo");
    const mkdirMock = vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
    const writeFileMock = vi.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
    const consoleLogMock = vi.spyOn(console, "log").mockImplementation(() => {});

    migrationCli.run([
      "node",
      "cli.js",
      "create",
      "add-email-to-users",
      "email:string",
      "--migration-path",
      "db/migrations",
    ]);

    expect(deps.argsParser.parse).toHaveBeenCalledWith([
      "email:string",
      "--migration-path",
      "db/migrations",
    ]);
    expect(deps.commandParser.parse).toHaveBeenCalledWith("add-email-to-users", ["email:string"]);
    expect(deps.pathResolver.resolve).toHaveBeenCalledWith("/repo", "db/migrations");
    expect(deps.generator.generate).toHaveBeenCalledWith({
      type: "add",
      column: "email",
      table: "users",
      dataType: "STRING",
    });

    const outputPath = "/repo/db/migrations/20260102030405-add-email-to-users.js";
    expect(mkdirMock).toHaveBeenCalledWith("/repo/db/migrations", { recursive: true });
    expect(writeFileMock).toHaveBeenCalledWith(outputPath, "module.exports = {}\n");
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Created db/migrations/20260102030405-add-email-to-users.js",
    );

    cwdMock.mockRestore();
  });
});
