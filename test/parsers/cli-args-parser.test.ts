import { describe } from "node:test";
import { expect, it } from "vitest";
import { CliArgsParser } from "../../src/core/parsers/cli-args-parser";

describe("cli-args-parser", () => {
  it("parses migration path with equals sign", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["--migration-path=./migrations", "add-email-to-users", "string"]);
    expect(result).toEqual({
      migrationPath: "./migrations",
      migrationArgs: ["add-email-to-users", "string"],
    });
  });

  it("parses migration path with space", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["--migration-path", "./migrations", "add-email-to-users"]);
    expect(result).toEqual({
      migrationPath: "./migrations",
      migrationArgs: ["add-email-to-users"],
    });
  });

  it("parses without migration path", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["add-email-to-users", "string"]);
    expect(result).toEqual({
      migrationArgs: ["add-email-to-users", "string"],
    });
  });

  it("parses with --migrations-path", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["--migrations-path=./db/migrations", "add-email-to-users"]);
    expect(result).toEqual({
      migrationPath: "./db/migrations",
      migrationArgs: ["add-email-to-users"],
    });
  });
  it("if arg is empty string, it should be ignored", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["", "--migration-path=./migrations", "add-email-to-users"]);
    expect(result).toEqual({
      migrationPath: "./migrations",
      migrationArgs: ["add-email-to-users"],
    });
  });
  it("if arg is --migrations-path, it should take next arg as path", () => {
    const parser = new CliArgsParser();
    const result = parser.parse(["--migrations-path", "./db/migrations", "add-email-to-users"]);
    expect(result).toEqual({
      migrationPath: "./db/migrations",
      migrationArgs: ["add-email-to-users"],
    });
  });
});
