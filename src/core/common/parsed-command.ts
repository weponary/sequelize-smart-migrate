export type CreateTableColumn =
  | { kind: "field"; name: string; dataType: string }
  | {
      kind: "relation";
      name: string;
      referenceTable: string;
      referenceKey: string;
      referenceType: string;
    };

export type ParsedCommand =
  | { type: "add"; column: string; table: string; dataType: string }
  | { type: "remove"; column: string; table: string }
  | { type: "rename"; oldCol: string; newCol: string; table: string }
  | { type: "createTable"; table: string; columns: CreateTableColumn[] }
  | { type: "dropTable"; table: string }
  | { type: "addIndex"; column: string; table: string; indexName: string }
  | { type: "removeIndex"; column: string; table: string; indexName: string }
  | { type: "change"; column: string; table: string; dataType: string };
