import { type ICliArgsParser } from "../common/contracts";

export type ParsedCliArgs = {
  migrationPath?: string;
  migrationArgs: string[];
};

export class CliArgsParser implements ICliArgsParser {
  public parse(args: readonly string[]): ParsedCliArgs {
    const migrationArgs: string[] = [];
    let migrationPath: string | undefined;

    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (!arg) continue;

      if (arg.startsWith("--migration-path=")) {
        migrationPath = arg.slice("--migration-path=".length);
        continue;
      }

      if (arg === "--migration-path") {
        migrationPath = args[i + 1];
        i += 1;
        continue;
      }

      if (arg.startsWith("--migrations-path=")) {
        migrationPath = arg.slice("--migrations-path=".length);
        continue;
      }

      if (arg === "--migrations-path") {
        migrationPath = args[i + 1];
        i += 1;
        continue;
      }

      migrationArgs.push(arg);
    }

    return migrationPath === undefined ? { migrationArgs } : { migrationPath, migrationArgs };
  }
}
