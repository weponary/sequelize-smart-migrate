import { type IDataTypeResolver } from "../../core/common/contracts";

const VALID_TYPES = [
  "string",
  "text",
  "int",
  "integer",
  "bool",
  "date",
  "float",
  "json",
  "jsonb",
  "uuid",
] as const;

type ValidType = (typeof VALID_TYPES)[number];

const TYPE_MAP: Record<ValidType, string> = {
  string: "Sequelize.STRING",
  text: "Sequelize.TEXT",
  int: "Sequelize.INTEGER",
  integer: "Sequelize.INTEGER",
  bool: "Sequelize.BOOLEAN",
  date: "Sequelize.DATE",
  float: "Sequelize.FLOAT",
  json: "Sequelize.JSON",
  jsonb: "Sequelize.JSONB",
  uuid: "Sequelize.UUID",
};

export class SequelizeTypeResolver implements IDataTypeResolver {
  private isValidType(value: string): value is ValidType {
    return (VALID_TYPES as readonly string[]).includes(value);
  }

  public resolve(dataType: string): string {
    if (!this.isValidType(dataType)) {
      throw new Error(
        `Unknown data type: "${dataType}". Valid types are: ${VALID_TYPES.join(", ")}`,
      );
    }

    return TYPE_MAP[dataType];
  }
}
