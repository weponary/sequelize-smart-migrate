import fs from "fs";
import path from "path";
import {
  ICliArgsParser,
  ICommandParser,
  IMigrationGenerator,
  IMigrationPathResolver,
} from "../common/contracts";

export class MigrationCli {
  public constructor(
    private readonly argsParser: ICliArgsParser,
    private readonly commandParser: ICommandParser,
    private readonly generator: IMigrationGenerator,
    private readonly pathResolver: IMigrationPathResolver,
  ) {}

  public run(argv: string[]): void {
    const [, , action, name, ...rest] = argv;

    if (action !== "create" || !name) {
      console.error("Usage: smart-migrate create <migration-name> [type]");
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
