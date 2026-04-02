import { type ICommandParser } from "../common/contracts";
import { type CreateTableColumn, type ParsedCommand } from "../common/parsed-command";

export class MigrationCommandParser implements ICommandParser {
  private splitNameAndType(arg: string): { name: string; rawType: string } {
    const sepIndex = arg.indexOf(":");
    if (sepIndex <= 0 || sepIndex === arg.length - 1) {
      throw new Error(
        `Invalid create-table attribute: "${arg}". Use <name>:<type> or <name>:references(<table>).`,
      );
    }

    return {
      name: arg.slice(0, sepIndex),
      rawType: arg.slice(sepIndex + 1),
    };
  }

  private parseRefSyntax(columnName: string, rawType: string): CreateTableColumn | null {
    if (!rawType.startsWith("ref")) {
      return null;
    }

    const parts = rawType.split(":");
    if (parts[0] !== "ref") {
      throw new Error(
        `Invalid relation syntax for "${columnName}": "${rawType}". Use ${columnName}:ref:<table>[:key[:type]].`,
      );
    }

    if (!parts[1]) {
      throw new Error(
        `Missing table name in relation syntax for "${columnName}". Use ${columnName}:ref:<table>[:key[:type]].`,
      );
    }

    if (parts.length > 4) {
      throw new Error(
        `Too many relation parts for "${columnName}: ${rawType}". Use ${columnName}:ref:<table>[:key[:type]].`,
      );
    }

    return {
      kind: "relation",
      name: columnName,
      referenceTable: parts[1],
      referenceKey: parts[2] ?? "id",
      referenceType: this.normalizeDataType(parts[3] ?? "integer"),
    };
  }

  private buildDefaultIndexName(table: string, column: string): string {
    return `${table}_${column}_idx`;
  }

  private parseCreateTableColumns(args: readonly string[]): CreateTableColumn[] {
    const columns: CreateTableColumn[] = [];

    for (const arg of args) {
      const { name, rawType } = this.splitNameAndType(arg);

      const relation = this.parseRefSyntax(name, rawType);
      if (relation) {
        columns.push(relation);
        continue;
      }

      columns.push({
        kind: "field",
        name,
        dataType: this.normalizeDataType(rawType),
      });
    }

    return columns;
  }

  private extractGroup(
    name: string,
    match: RegExpMatchArray,
    index: number,
    label: string,
  ): string {
    const value = match[index];
    if (!value) {
      throw new Error(`${label} is missing in migration name: "${name}"`);
    }
    return value;
  }

  private normalizeDataType(raw: string): string {
    return raw.includes(":") ? (raw.split(":").pop() ?? "string") : raw;
  }

  public parse(name: string, args: readonly string[]): ParsedCommand {
    let match: RegExpMatchArray | null;

    match = name.match(/^add-([^-]+)-to-([^-]+)$/);
    if (match) {
      const column = this.extractGroup(name, match, 1, "Column name");
      const table = this.extractGroup(name, match, 2, "Table name");
      const rawType = args[0] ?? "string";
      return {
        type: "add",
        column,
        table,
        dataType: this.normalizeDataType(rawType),
      };
    }

    match = name.match(/^remove-([^-]+)-from-([^-]+)$/);
    if (match) {
      const column = this.extractGroup(name, match, 1, "Column name");
      const table = this.extractGroup(name, match, 2, "Table name");
      return { type: "remove", column, table };
    }

    match = name.match(/^rename-([^-]+)-to-([^-]+)-in-([^-]+)$/);
    if (match) {
      const oldCol = this.extractGroup(name, match, 1, "Old column name");
      const newCol = this.extractGroup(name, match, 2, "New column name");
      const table = this.extractGroup(name, match, 3, "Table name");
      return { type: "rename", oldCol, newCol, table };
    }

    match = name.match(/^drop-table-([^-]+)$/);
    if (match) {
      const table = this.extractGroup(name, match, 1, "Table name");
      return { type: "dropTable", table };
    }

    match = name.match(/^create-table-([^-]+)$/);
    if (match) {
      const table = this.extractGroup(name, match, 1, "Table name");
      if (args.length === 0) {
        throw new Error(
          `Missing attributes for create-table migration "${name}". Example: create-table-users name:string clientId:ref:clients:id:uuid`,
        );
      }

      return {
        type: "createTable",
        table,
        columns: this.parseCreateTableColumns(args),
      };
    }

    match = name.match(/^add-index-([^-]+)-to-([^-]+)$/);
    if (match) {
      const column = this.extractGroup(name, match, 1, "Column name");
      const table = this.extractGroup(name, match, 2, "Table name");
      const indexName = this.buildDefaultIndexName(table, column);
      return { type: "addIndex", column, table, indexName };
    }

    match = name.match(/^remove-index-([^-]+)-from-([^-]+)$/);
    if (match) {
      const column = this.extractGroup(name, match, 1, "Column name");
      const table = this.extractGroup(name, match, 2, "Table name");
      const indexName = this.buildDefaultIndexName(table, column);
      return { type: "removeIndex", column, table, indexName };
    }

    match = name.match(/^change-([^-]+)-in-([^-]+)$/);
    if (match) {
      const column = this.extractGroup(name, match, 1, "Column name");
      const table = this.extractGroup(name, match, 2, "Table name");
      const rawType = args[0] ?? "string";
      return {
        type: "change",
        column,
        table,
        dataType: this.normalizeDataType(rawType),
      };
    }

    throw new Error(`Unrecognized migration pattern: "${name}"`);
  }
}
