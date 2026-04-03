import { describe, expect, it, vi } from "vitest";

import { SequelizeMigrationGenerator } from "../../../src/orms/sequelize/sequelize-migration-generator";

describe("SequelizeMigrationGenerator", () => {
  it("generates add migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "add",
      table: "users",
      column: "email",
      dataType: "string",
    });

    expect(out).toContain("addColumn('users', 'email'");
    expect(out).toContain("type: RESOLVED_STRING");
    expect(resolve).toHaveBeenCalledWith("string");
  });

  it("generates remove migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "remove",
      table: "users",
      column: "email",
    });

    expect(out).toContain("removeColumn('users', 'email')");
    expect(out).toContain("addColumn('users', 'email'");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("generates rename migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "rename",
      table: "users",
      oldCol: "fname",
      newCol: "firstName",
    });

    expect(out).toContain("renameColumn('users', 'fname', 'firstName')");
    expect(out).toContain("renameColumn('users', 'firstName', 'fname')");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("generates createTable migration with default id and relation column", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "createTable",
      table: "posts",
      columns: [
        { kind: "field", name: "title", dataType: "string" },
        {
          kind: "relation",
          name: "authorId",
          referenceTable: "users",
          referenceKey: "id",
          referenceType: "uuid",
        },
      ],
    });

    expect(out).toContain("createTable('posts'");
    expect(out).toContain("autoIncrement: true");
    expect(out).toContain("type: Sequelize.INTEGER");
    expect(out).toContain("title: {");
    expect(out).toContain("type: RESOLVED_STRING");
    expect(out).toContain("authorId: {");
    expect(out).toContain("tableName: 'users'");
    expect(out).toContain("key: 'id'");
    expect(out).toContain("type: RESOLVED_UUID");
    expect(out).toContain("onUpdate: 'CASCADE'");
    expect(out).toContain("onDelete: 'SET NULL'");
    expect(out).toContain("createdAt: {");
    expect(out).toContain("updatedAt: {");
  });

  it("generates createTable migration with uuid id override", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "createTable",
      table: "accounts",
      columns: [
        { kind: "field", name: "id", dataType: "uuid" },
        { kind: "field", name: "name", dataType: "string" },
      ],
    });

    expect(out).toContain("type: Sequelize.UUID");
    expect(out).toContain("defaultValue: Sequelize.UUIDV4");
    expect(out).not.toContain("autoIncrement: true");
    expect(out).toContain("name: {");
    expect(resolve).toHaveBeenCalledWith("string");
    expect(resolve).not.toHaveBeenCalledWith("uuid");
  });

  it("generates createTable migration with non-uuid id override via resolver", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "createTable",
      table: "metrics",
      columns: [{ kind: "field", name: "id", dataType: "integer" }],
    });

    expect(out).toContain("type: RESOLVED_INTEGER");
    expect(resolve).toHaveBeenCalledWith("integer");
  });

  it("generates dropTable migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "dropTable",
      table: "users",
    });

    expect(out).toContain("dropTable('users')");
    expect(out).toContain("Cannot automatically revert dropTable for users");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("generates addIndex migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "addIndex",
      table: "users",
      column: "email",
      indexName: "users_email_idx",
    });

    expect(out).toContain("addIndex('users', ['email']");
    expect(out).toContain("name: 'users_email_idx'");
    expect(out).toContain("removeIndex('users', 'users_email_idx')");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("generates removeIndex migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "removeIndex",
      table: "users",
      column: "email",
      indexName: "users_email_idx",
    });

    expect(out).toContain("removeIndex('users', 'users_email_idx')");
    expect(out).toContain("addIndex('users', ['email']");
    expect(out).toContain("name: 'users_email_idx'");
    expect(resolve).not.toHaveBeenCalled();
  });

  it("generates change migration", () => {
    const resolve = vi.fn((dataType: string) => `RESOLVED_${dataType.toUpperCase()}`);
    const generator = new SequelizeMigrationGenerator({ resolve });

    const out = generator.generate({
      type: "change",
      table: "users",
      column: "email",
      dataType: "text",
    });

    expect(out).toContain("changeColumn('users', 'email'");
    expect(out).toContain("type: RESOLVED_TEXT");
    expect(resolve).toHaveBeenCalledWith("text");
  });
});
