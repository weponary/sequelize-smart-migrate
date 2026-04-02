import { type ParsedCliArgs } from "../parsers/cli-args-parser";
import { type ParsedCommand } from "./parsed-command";

export interface ICliArgsParser {
  parse(args: readonly string[]): ParsedCliArgs;
}

export interface ICommandParser {
  parse(name: string, args: readonly string[]): ParsedCommand;
}

export interface IDataTypeResolver {
  resolve(dataType: string): string;
}

export interface IMigrationGenerator {
  generate(command: ParsedCommand): string;
}

export interface IMigrationPathResolver {
  resolve(cwd: string, overridePath?: string): string;
}
