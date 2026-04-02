import { type IMigrationGenerator, type IDataTypeResolver } from "../../core/common/contracts";
import { type ParsedCommand } from "../../core/common/parsed-command";
import { ADD_MIGRATION_TEMPLATE } from "./migrations/add.template";
import { ADD_INDEX_MIGRATION_TEMPLATE } from "./migrations/add-index.template";
import { CHANGE_COLUMN_MIGRATION_TEMPLATE } from "./migrations/change-column.template";
import { CREATE_TABLE_MIGRATION_TEMPLATE } from "./migrations/create-table.template";
import { DROP_TABLE_MIGRATION_TEMPLATE } from "./migrations/drop-table.template";
import { REMOVE_MIGRATION_TEMPLATE } from "./migrations/remove.template";
import { REMOVE_INDEX_MIGRATION_TEMPLATE } from "./migrations/remove-index.template";
import { RENAME_MIGRATION_TEMPLATE } from "./migrations/rename.template";

export class SequelizeMigrationGenerator implements IMigrationGenerator {
  public constructor(private readonly typeResolver: IDataTypeResolver) {}

  private renderDefaultId(lines: string[]): void {
    lines.push(
      "      id: {",
      "        allowNull: false,",
      "        autoIncrement: true,",
      "        primaryKey: true,",
      "        type: Sequelize.INTEGER,",
      "      },",
    );
  }

  private renderOverriddenId(dataType: string, lines: string[]): void {
    if (dataType === "uuid") {
      lines.push(
        "      id: {",
        "        type: Sequelize.UUID,",
        "        defaultValue: Sequelize.UUIDV4,",
        "        primaryKey: true,",
        "        allowNull: false,",
        "      },",
      );
      return;
    }

    lines.push(
      "      id: {",
      `        type: ${this.typeResolver.resolve(dataType)},`,
      "        primaryKey: true,",
      "        allowNull: false,",
      "      },",
    );
  }

  private renderCreateTableColumns(
    command: Extract<ParsedCommand, { type: "createTable" }>,
  ): string {
    const lines: string[] = [];
    const idOverride = command.columns.find(
      (column): column is Extract<typeof column, { kind: "field" }> =>
        column.kind === "field" && column.name === "id",
    );

    if (idOverride) {
      this.renderOverriddenId(idOverride.dataType, lines);
    } else {
      this.renderDefaultId(lines);
    }

    for (const column of command.columns) {
      if (column.kind === "field") {
        if (column.name === "id") {
          continue;
        }

        lines.push(
          `      ${column.name}: {`,
          `        type: ${this.typeResolver.resolve(column.dataType)},`,
          "      },",
        );
        continue;
      }

      lines.push(
        `      ${column.name}: {`,
        `        type: ${this.typeResolver.resolve(column.referenceType)},`,
        "        references: {",
        "          model: {",
        `            tableName: '${column.referenceTable}',`,
        "          },",
        `          key: '${column.referenceKey}',`,
        "        },",
        "        onUpdate: 'CASCADE',",
        "        onDelete: 'SET NULL',",
        "      },",
      );
    }

    lines.push(
      "      createdAt: {",
      "        allowNull: false,",
      "        type: Sequelize.DATE,",
      "      },",
      "      updatedAt: {",
      "        allowNull: false,",
      "        type: Sequelize.DATE,",
      "      },",
    );

    return lines.join("\n");
  }

  private render(template: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce((out, [key, value]) => {
      return out.split(`{{${key}}}`).join(value);
    }, template);
  }

  public generate(command: ParsedCommand): string {
    switch (command.type) {
      case "add":
        return this.render(ADD_MIGRATION_TEMPLATE, {
          table: command.table,
          column: command.column,
          sequelizeType: this.typeResolver.resolve(command.dataType),
        });

      case "remove":
        return this.render(REMOVE_MIGRATION_TEMPLATE, {
          table: command.table,
          column: command.column,
        });

      case "rename":
        return this.render(RENAME_MIGRATION_TEMPLATE, {
          table: command.table,
          oldCol: command.oldCol,
          newCol: command.newCol,
        });

      case "createTable":
        return this.render(CREATE_TABLE_MIGRATION_TEMPLATE, {
          table: command.table,
          columns: this.renderCreateTableColumns(command),
        });

      case "dropTable":
        return this.render(DROP_TABLE_MIGRATION_TEMPLATE, {
          table: command.table,
        });

      case "addIndex":
        return this.render(ADD_INDEX_MIGRATION_TEMPLATE, {
          table: command.table,
          column: command.column,
          indexName: command.indexName,
        });

      case "removeIndex":
        return this.render(REMOVE_INDEX_MIGRATION_TEMPLATE, {
          table: command.table,
          column: command.column,
          indexName: command.indexName,
        });

      case "change":
        return this.render(CHANGE_COLUMN_MIGRATION_TEMPLATE, {
          table: command.table,
          column: command.column,
          sequelizeType: this.typeResolver.resolve(command.dataType),
        });
    }
  }
}
