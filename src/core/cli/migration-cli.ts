import fs from "fs";
import path from "path";
import {
  type ICliArgsParser,
  type ICommandParser,
  type IMigrationGenerator,
  type IMigrationPathResolver,
} from "../common/contracts";

const USAGE = "Usage: smart-migrate create <migration-name> [args...]";
const HELP_TEXT = [
  USAGE,
  "",
  "Docs:",
  "  https://github.com/weponary/sequelize-smart-migrate#readme",
  "",
  "Commands:",
  "  create <migration-name> [args...]  Generate a Sequelize migration file",
  "",
  "Supported migration-name patterns:",
  "  add-<column>-to-<table> [type]",
  "  remove-<column>-from-<table>",
  "  rename-<old>-to-<new>-in-<table>",
  "  change-<column>-in-<table> [type]",
  "  create-table-<table> <column:type...>",
  "  drop-table-<table>",
  "  add-index-<column>-to-<table>",
  "  remove-index-<column>-from-<table>",
  "",
  "Flags:",
  "  -h, --help                    Show this help",
  "  --migration-path <path>       Output directory for migrations",
  "  --migration-path=<path>       Output directory for migrations",
  "  --migrations-path <path>      Alias for --migration-path",
  "  --migrations-path=<path>      Alias for --migration-path",
  "",
  "Examples:",
  "  smart-migrate create add-email-to-users string",
  "  smart-migrate create create-table-orders total:float clientId:ref:clients:id:uuid",
  "  smart-migrate create add-index-email-to-users --migration-path db/migrations",
].join("\n");

export class MigrationCli {
  public constructor(
    private readonly argsParser: ICliArgsParser,
    private readonly commandParser: ICommandParser,
    private readonly generator: IMigrationGenerator,
    private readonly pathResolver: IMigrationPathResolver,
  ) {}

  public run(argv: string[]): void {
    const [, , action, name, ...rest] = argv;

    if (action === "--help" || action === "-h" || action === "help") {
      console.log(HELP_TEXT);
      return;
    }

    if (action !== "create" || !name) {
      console.error(USAGE);
      process.exit(1);
    }

    const { migrationPath, migrationArgs } = this.argsParser.parse(rest);
    const command = this.commandParser.parse(name, migrationArgs);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const filename = `${timestamp}-${name}.js`;
    const cwd = process.cwd();
    const outDir = this.pathResolver.resolve(cwd, migrationPath);
    const outputPath = path.join(outDir, filename);

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outputPath, this.generator.generate(command));

    console.log(`Created ${path.relative(cwd, outputPath)}`);
  }
}
