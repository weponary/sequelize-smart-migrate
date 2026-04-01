import { MigrationCli } from "./core/cli/migration-cli";
import { CliArgsParser } from "./core/parsers/cli-args-parser";
import { MigrationCommandParser } from "./core/parsers/migration-command-parser";
import { MigrationPathResolver } from "./core/path/migration-path-resolver";
import { SequelizeMigrationGenerator } from "./orms/sequelize/sequelize-migration-generator";
import { SequelizeTypeResolver } from "./orms/sequelize/sequelize-type-resolver";

const cli = new MigrationCli(
  new CliArgsParser(),
  new MigrationCommandParser(),
  new SequelizeMigrationGenerator(new SequelizeTypeResolver()),
  new MigrationPathResolver(),
);

cli.run(process.argv);
