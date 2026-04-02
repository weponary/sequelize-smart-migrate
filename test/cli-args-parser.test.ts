import { describe, expect, it } from "vitest";
import { CliArgsParser } from "../src/core/parsers/cli-args-parser";

describe("CliArgsParser", () => {
  it("extracts --migration-path=value and preserves remaining args", () => {
    const parser = new CliArgsParser();

    const result = parser.parse([
      "create-table-users",
      "name:string",
      "--migration-path=./db/migrations",
    ]);

    expect(result).toEqual({
      migrationPath: "./db/migrations",
      migrationArgs: ["create-table-users", "name:string"],
    });
  });

  it("extracts --migrations-path value from next argument", () => {
    const parser = new CliArgsParser();

    const result = parser.parse(["add-email-to-users", "--migrations-path", "custom/migrations"]);

    expect(result).toEqual({
      migrationPath: "custom/migrations",
      migrationArgs: ["add-email-to-users"],
    });
  });

  it("returns only migration args when no path flag exists", () => {
    const parser = new CliArgsParser();

    const result = parser.parse(["remove-email-from-users"]);

    expect(result).toEqual({
      migrationArgs: ["remove-email-from-users"],
    });
  });
});
