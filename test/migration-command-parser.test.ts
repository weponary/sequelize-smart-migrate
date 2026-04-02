import { describe, expect, it } from "vitest";
import { MigrationCommandParser } from "../src/core/parsers/migration-command-parser";

describe("MigrationCommandParser", () => {
  it("parses add migration with explicit data type", () => {
    const parser = new MigrationCommandParser();

    const result = parser.parse("add-email-to-users", ["string"]);

    expect(result).toEqual({
      type: "add",
      column: "email",
      table: "users",
      dataType: "string",
    });
  });

  it("parses create-table migration with field and relation columns", () => {
    const parser = new MigrationCommandParser();

    const result = parser.parse("create-table-orders", [
      "id:uuid",
      "clientId:ref:clients:id:uuid",
    ]);

    expect(result).toEqual({
      type: "createTable",
      table: "orders",
      columns: [
        { kind: "field", name: "id", dataType: "uuid" },
        {
          kind: "relation",
          name: "clientId",
          referenceTable: "clients",
          referenceKey: "id",
          referenceType: "uuid",
        },
      ],
    });
  });

  it("throws on create-table without attributes", () => {
    const parser = new MigrationCommandParser();

    expect(() => parser.parse("create-table-users", [])).toThrow(
      "Missing attributes for create-table migration",
    );
  });

  it("throws on unrecognized migration pattern", () => {
    const parser = new MigrationCommandParser();

    expect(() => parser.parse("unknown-pattern", [])).toThrow(
      'Unrecognized migration pattern: "unknown-pattern"',
    );
  });
});
