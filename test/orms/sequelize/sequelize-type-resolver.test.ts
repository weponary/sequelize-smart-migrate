import { describe, expect, it } from "vitest";

import { SequelizeTypeResolver } from "../../../src/orms/sequelize/sequelize-type-resolver";

describe("SequelizeTypeResolver", () => {
  const resolver = new SequelizeTypeResolver();

  it("resolves all supported types to Sequelize constants", () => {
    expect(resolver.resolve("string")).toBe("Sequelize.STRING");
    expect(resolver.resolve("text")).toBe("Sequelize.TEXT");
    expect(resolver.resolve("int")).toBe("Sequelize.INTEGER");
    expect(resolver.resolve("integer")).toBe("Sequelize.INTEGER");
    expect(resolver.resolve("bool")).toBe("Sequelize.BOOLEAN");
    expect(resolver.resolve("date")).toBe("Sequelize.DATE");
    expect(resolver.resolve("float")).toBe("Sequelize.FLOAT");
    expect(resolver.resolve("json")).toBe("Sequelize.JSON");
    expect(resolver.resolve("jsonb")).toBe("Sequelize.JSONB");
    expect(resolver.resolve("uuid")).toBe("Sequelize.UUID");
  });

  it("throws a descriptive error for unknown types", () => {
    expect(() => resolver.resolve("varchar")).toThrow(
      'Unknown data type: "varchar". Valid types are: string, text, int, integer, bool, date, float, json, jsonb, uuid',
    );
  });
});
