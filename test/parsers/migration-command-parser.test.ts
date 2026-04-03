import { describe, it, expect, vi } from "vitest";
import { MigrationCommandParser } from "../../src/core/parsers/migration-command-parser";

describe("MigrationCommandParser", () => {
  const parser = new MigrationCommandParser();

  // helper for type narrowing
  function expectType<T extends string>(
    result: { type: string },
    type: T,
  ): { type: T } & Record<string, unknown> {
    if (result.type !== type) throw new Error();
    return result as { type: T } & Record<string, unknown>;
  }

  describe("add column", () => {
    it("should parse add column command", () => {
      const result = parser.parse("add-name-to-users", ["string"]);

      expect(result).toEqual({
        type: "add",
        column: "name",
        table: "users",
        dataType: "string",
      });
    });

    it("should default datatype to string", () => {
      const result = expectType(parser.parse("add-age-to-users", []), "add");

      expect(result.dataType).toBe("string");
    });

    it("should handle datatype without colon (line 92)", () => {
      const result = expectType(parser.parse("add-age-to-users", ["number"]), "add");

      expect(result.dataType).toBe("number");
    });

    it("should fallback datatype to string when split result is empty", () => {
      const splitSpy = vi
        .spyOn(String.prototype, "split")
        .mockReturnValueOnce([] as unknown as string[]);

      const result = expectType(parser.parse("add-age-to-users", ["type:broken"]), "add");

      expect(result.dataType).toBe("string");
      splitSpy.mockRestore();
    });
  });

  describe("remove column", () => {
    it("should parse remove column command", () => {
      const result = parser.parse("remove-name-from-users", []);

      expect(result).toEqual({
        type: "remove",
        column: "name",
        table: "users",
      });
    });
  });

  describe("rename column", () => {
    it("should parse rename column command", () => {
      const result = parser.parse("rename-name-to-fullName-in-users", []);

      expect(result).toEqual({
        type: "rename",
        oldCol: "name",
        newCol: "fullName",
        table: "users",
      });
    });
  });

  describe("drop table", () => {
    it("should parse drop table command", () => {
      const result = parser.parse("drop-table-users", []);

      expect(result).toEqual({
        type: "dropTable",
        table: "users",
      });
    });
  });

  describe("create table", () => {
    it("should parse create table with fields", () => {
      const result = parser.parse("create-table-users", ["name:string", "age:number"]);

      expect(result).toEqual({
        type: "createTable",
        table: "users",
        columns: [
          { kind: "field", name: "name", dataType: "string" },
          { kind: "field", name: "age", dataType: "number" },
        ],
      });
    });

    it("should parse relation column", () => {
      const result = parser.parse("create-table-orders", ["userId:ref:users:id:uuid"]);

      if (result.type !== "createTable") throw new Error();

      expect(result.columns[0]).toEqual({
        kind: "relation",
        name: "userId",
        referenceTable: "users",
        referenceKey: "id",
        referenceType: "uuid",
      });
    });

    it("should use default ref key and type", () => {
      const result = parser.parse("create-table-users", ["userId:ref:users"]);

      if (result.type !== "createTable") throw new Error();

      expect(result.columns[0]).toEqual({
        kind: "relation",
        name: "userId",
        referenceTable: "users",
        referenceKey: "id",
        referenceType: "integer",
      });
    });

    it("should normalize datatype with multiple colons", () => {
      const result = parser.parse("create-table-users", ["name:type:string"]);

      if (result.type !== "createTable") throw new Error();

      expect(result.columns[0]).toEqual({
        kind: "field",
        name: "name",
        dataType: "string",
      });
    });

    it("should throw if no args provided", () => {
      expect(() => parser.parse("create-table-users", [])).toThrow();
    });

    it("should throw invalid attribute format", () => {
      expect(() => parser.parse("create-table-users", ["invalidformat"])).toThrow();
    });

    it("should throw when ':' at start", () => {
      expect(() => parser.parse("create-table-users", [":string"])).toThrow();
    });

    it("should throw when ':' at end", () => {
      expect(() => parser.parse("create-table-users", ["name:"])).toThrow();
    });

    it("should throw missing table in ref", () => {
      expect(() => parser.parse("create-table-users", ["userId:ref"])).toThrow();
    });

    it("should throw too many ref parts", () => {
      expect(() =>
        parser.parse("create-table-users", ["userId:ref:users:id:uuid:extra"]),
      ).toThrow();
    });

    it("should throw invalid ref prefix", () => {
      expect(() => parser.parse("create-table-users", ["userId:refx:users"])).toThrow();
    });
  });

  describe("index", () => {
    it("should parse add index", () => {
      const result = parser.parse("add-index-name-to-users", []);

      expect(result).toEqual({
        type: "addIndex",
        column: "name",
        table: "users",
        indexName: "users_name_idx",
      });
    });

    it("should parse remove index", () => {
      const result = parser.parse("remove-index-name-from-users", []);

      expect(result).toEqual({
        type: "removeIndex",
        column: "name",
        table: "users",
        indexName: "users_name_idx",
      });
    });
  });

  describe("change column", () => {
    it("should parse change column", () => {
      const result = parser.parse("change-name-in-users", ["text"]);

      expect(result).toEqual({
        type: "change",
        column: "name",
        table: "users",
        dataType: "text",
      });
    });

    it("should default datatype", () => {
      const result = expectType(parser.parse("change-name-in-users", []), "change");

      expect(result.dataType).toBe("string");
    });
  });

  describe("errors", () => {
    it("should throw on invalid command", () => {
      expect(() => parser.parse("invalid-command", [])).toThrow();
    });

    // 🔥 covers extractGroup unreachable branch (line 86)
    it("should throw when extractGroup gets undefined", () => {
      const spy = vi
        .spyOn(String.prototype, "match")
        .mockReturnValueOnce(["add--to-users", undefined, "users"] as unknown as RegExpMatchArray);

      expect(() => parser.parse("add--to-users", ["string"])).toThrow("Column name is missing");

      spy.mockRestore();
    });
  });
});
