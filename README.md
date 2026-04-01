# sequelize-smart-migrate

Template-driven migration generator for Sequelize projects.

Create migration files from readable command names instead of writing boilerplate manually.

## Install

```bash
npm install -D sequelize-smart-migrate
```

## Quick Start

```bash
# Add a column
npx smart-migrate create add-email-to-users string

# Create a table with fields + foreign keys
npx smart-migrate create create-table-orders total:float clientId:ref:clients sessionId:ref:sessions:uuid:uuid

# Run migrations
npx sequelize-cli db:migrate
```

## Command Format

```bash
npx smart-migrate create <migration-name> [args...]
```

## Supported Patterns

### 1. Create Table

**Pattern:** `create-table-<table> <attributes...>`

**Purpose:** Generate a new table with columns, types, and foreign key relationships.

**Example:**

```bash
npx smart-migrate create create-table-users id:uuid email:string name:string
npx smart-migrate create create-table-orders total:float status:string clientId:ref:clients
```

**Generated Output:**

- Creates table with specified columns
- Automatically adds `createdAt` and `updatedAt` timestamps
- By default, an auto-increment `id` (unless you override with `id:uuid` or `id:string`)
- Foreign key columns include proper references and CASCADE rules

**When to use:** When building a new feature or database module that needs a fresh table.

---

### 2. Drop Table

**Pattern:** `drop-table-<table>`

**Purpose:** Generate a migration that drops (deletes) an entire table.

**Example:**

```bash
npx smart-migrate create drop-table-old-sessions
npx smart-migrate create drop-table-temp-data
```

**When to use:** When you're removing a feature or consolidating tables and need to clean up old tables.

---

### 3. Add Column

**Pattern:** `add-<column>-to-<table> [type]`

**Purpose:** Add a new column to an existing table (after initial creation).

**Examples:**

```bash
# Add a simple string column
npx smart-migrate create add-phone-to-users string

# Add a numeric column
npx smart-migrate create add-balance-to-accounts float

# Add a boolean flag
npx smart-migrate create add-is-verified-to-users bool

# Add a reference to another table
npx smart-migrate create add-session-id-to-users ref:sessions
```

**Important:**

- Default type is `string` (if you omit the type)
- New columns are nullable by default (can store NULL values)
- Use when evolving an existing table

**When to use:** During feature development when you need to add a new field to an existing table.

---

### 4. Remove Column

**Pattern:** `remove-<column>-from-<table>`

**Purpose:** Remove a column from a table (data in that column is lost).

**Example:**

```bash
npx smart-migrate create remove-expired-at-from-sessions
npx smart-migrate create remove-legacy-id-from-users
```

**Warning:** This is destructive. Data in the removed column cannot be recovered.

**When to use:** When you want to clean up unused columns or simplify your schema.

---

### 5. Rename Column

**Pattern:** `rename-<old-column>-to-<new-column>-in-<table>`

**Purpose:** Rename a column while preserving all data.

**Example:**

```bash
# Rename `user_id` to `customer_id`
npx smart-migrate create rename-user-id-to-customer-id-in-orders

# Rename `created` to `created_at`
npx smart-migrate create rename-created-to-created-at-in-posts
```

**When to use:** When fixing naming inconsistencies or improving clarity without losing data.

---

### 6. Change Column Type

**Pattern:** `change-<column>-in-<table> [type]`

**Purpose:** Modify a column's data type (e.g., upgrade from `string` to `text`).

**Examples:**

```bash
# Change a string to text for longer content
npx smart-migrate create change-description-in-products text

# Change integer to float for new calculations
npx smart-migrate create change-price-in-items float

# Change to JSON for flexible data
npx smart-migrate create change-metadata-in-users json
```

**When to use:** When a column's current type is insufficient for new requirements.

---

### 7. Add Index

**Pattern:** `add-index-<column>-to-<table>`

**Purpose:** Create an index on a column to speed up queries.

**Examples:**

```bash
# Index email for fast lookups
npx smart-migrate create add-index-email-to-users

# Index created_at for filtering by date
npx smart-migrate create add-index-created-at-to-posts

# Index foreign key for joins
npx smart-migrate create add-index-client-id-to-orders
```

**When to use:** When you have columns that are frequently searched, filtered, or used in WHERE clauses.

---

### 8. Remove Index

**Pattern:** `remove-index-<column>-from-<table>`

**Purpose:** Remove an index to save storage space or if it's rarely used.

**Example:**

```bash
npx smart-migrate create remove-index-old-status-from-orders
```

**When to use:** When an index isn't improving performance or is consuming unnecessary resources.

## How to Define Columns

### Regular Columns (Built-in Types)

**Syntax:**

```text
<columnName>:<type>
```

**What it means:** Create a column named `columnName` with the specified `type`. The column can store NULL values by default (when using `add`, `change`, `remove` operations).

**Examples:**

```bash
# In create-table command:
npx smart-migrate create create-table-products name:string price:float description:text in_stock:bool

# In add-column command:
npx smart-migrate create add-rating-to-products int
npx smart-migrate create add-is-active-to-users bool
```

**Supported Types:**

- `string` — Short text (VARCHAR, max ~255 chars)
- `text` — Long text (unlimited)
- `int` or `integer` — Whole numbers
- `float` — Decimal numbers
- `bool` — True/False values
- `date` — Calendar dates
- `json` — JSON objects and arrays
- `jsonb` — Binary JSON (PostgreSQL specific)
- `uuid` — Unique identifiers (36-char format)

**Example type selection:**

```bash
create-table-articles \
  title:string \
  body:text \
  view_count:integer \
  rating:float \
  published:bool \
  published_at:date \
  tags:json \
  id:uuid  # Override the default auto-increment ID
```

---

### Foreign Keys (References Between Tables)

**Syntax:**

```text
<fkColumnName>:ref:<foreignTable>[:foreignKeyName[:foreignKeyType]]
```

**What it means:** Create a column that **references** (links to) another table. By default, it links to the `id` column of the referenced table as an INTEGER foreign key.

**Breaking it down:**

- `<fkColumnName>` — The column name in the current table
- `ref` — Special keyword meaning "this is a foreign key"
- `<foreignTable>` — The table being referenced
- `[:foreignKeyName]` — (Optional) The column name in the foreign table to link to (defaults to `id`)
- `[:foreignKeyType]` — (Optional) The data type of the foreign key (defaults to `integer`)

**Examples:**

```bash
# Simple foreign key (links to users.id as INTEGER)
npx smart-migrate create create-table-posts content:string user_id:ref:users

# Reference a UUID primary key
npx smart-migrate create create-table-comments text:text article_id:ref:articles:id:uuid

# Multiple foreign keys in one table
npx smart-migrate create create-table-orders \
  total:float \
  customer_id:ref:customers \
  session_id:ref:sessions:id:uuid \
  warehouse_id:ref:warehouses:id:integer
```

**What gets generated:**

```javascript
// Example: user_id:ref:users
user_id: {
  type: Sequelize.INTEGER,
  references: {
    model: { tableName: 'users' },
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
}
```

**When to use:**

- `clientId:ref:clients` — When you have a default auto-increment integer ID
- `sessionId:ref:sessions:id:uuid` — When the foreign table has a UUID primary key
- `orgId:ref:organizations:id:bigint` — When linking to non-standard key types

---

### Column Defaults in Different Commands

**In `create-table` command:**

- New columns do NOT have `allowNull: true` (they are required by default)
- Foreign key columns are also required by default
- Only timestamps (`createdAt`, `updatedAt`) are NOT NULL

**In `add`, `change`, `remove` commands:**

- New columns added later ARE nullable by default (`allowNull: true`)
- This is because existing rows can't have values for a new column

**Why the difference?**
When creating a table from scratch, all columns should usually have values. But when adding a column to an existing table with data, the new column needs to accept NULL for existing rows.

## Primary Key (ID) Behavior in `create-table`

Every table needs a unique identifier. Here's how it works:

### Default Behavior (Standard Integer ID)

If you don't specify an `id` column:

```bash
npx smart-migrate create create-table-users email:string name:string
```

**Generated:**

```javascript
id: {
  type: Sequelize.INTEGER,
  autoIncrement: true,
  primaryKey: true,
  allowNull: false
}
```

---

### Override with UUID

If you add `id:uuid`:

```bash
npx smart-migrate create create-table-users id:uuid email:string name:string
```

**Generated:**

```javascript
id: {
  type: Sequelize.UUID,
  primaryKey: true,
  allowNull: false,
  defaultValue: Sequelize.UUIDV4
}
```

Each new row automatically gets a unique UUID generated.

---

### Override with Other Types

You can use any type for the ID:

```bash
npx smart-migrate create create-table-api-keys id:string key_hash:string user_id:ref:users
```

**When to use each:**

- `id:integer` (default) — Standard auto-incrementing IDs, most common
- `id:uuid` — When you need globally unique IDs, distributed systems, or privacy
- `id:string` — Custom identifiers like API keys or slugs

## Programmatic Usage (TypeScript)

Instead of using the CLI, you can use smart-migrate in your code:

```ts
import {
  MigrationCommandParser,
  SequelizeMigrationGenerator,
  SequelizeTypeResolver,
} from "sequelize-smart-migrate";

const parser = new MigrationCommandParser();
const generator = new SequelizeMigrationGenerator(new SequelizeTypeResolver());

// Parse the migration command
const cmd = parser.parse("create-table-orders", [
  "total:float",
  "clientId:ref:clients",
  "sessionId:ref:sessions:id:uuid",
]);

// Generate the migration source code
const migrationSource = generator.generate(cmd);

// migrationSource now contains valid Sequelize migration JavaScript
console.log(migrationSource);
```

**Use cases:**

- Generate migrations programmatically from your app
- Build custom migration builders on top of smart-migrate
- Integrate with build pipelines or deployment scripts

---

## Programmatic Usage (JavaScript)

```js
const {
  MigrationCommandParser,
  SequelizeMigrationGenerator,
  SequelizeTypeResolver,
} = require("sequelize-smart-migrate");

const parser = new MigrationCommandParser();
const generator = new SequelizeMigrationGenerator(new SequelizeTypeResolver());

// Example: Add a verified email feature
const cmd = parser.parse("add-email-verified-to-users", ["bool"]);
const migrationSource = generator.generate(cmd);

// Write to a file, send to CI/CD, etc.
```

---

## Real-World Example Walkthrough

Let's build a simple e-commerce app:

```bash
# 1. Create users table
npx smart-migrate create create-table-users \
  id:uuid \
  email:string \
  password_hash:string \
  created_at:date

# 2. Create products table
npx smart-migrate create create-table-products \
  name:string \
  description:text \
  price:float \
  stock:integer

# 3. Create orders table linking to users
npx smart-migrate create create-table-orders \
  id:uuid \
  total:float \
  user_id:ref:users:id:uuid \
  status:string

# 4. Create order_items linking orders to products
npx smart-migrate create create-table-order-items \
  quantity:integer \
  unit_price:float \
  order_id:ref:orders:id:uuid \
  product_id:ref:products

# 5. Add a discount feature
npx smart-migrate create add-discount-code-to-orders string

# 6. Add indexing for faster queries
npx smart-migrate create add-index-user-id-to-orders
npx smart-migrate create add-index-product-id-to-order-items

# 7. Later: rename a column
npx smart-migrate create rename-created-at-to-created-at-utc-in-users

# 8. Later: add new field type
npx smart-migrate create add-is-premium-to-users bool
```

All these migrations are generated automatically — no boilerplate writing!

---

## Quick Reference

| Operation     | Command                              | Example                                   |
| ------------- | ------------------------------------ | ----------------------------------------- |
| Create table  | `create-table-<table> <attrs>`       | `create-table-users id:uuid email:string` |
| Drop table    | `drop-table-<table>`                 | `drop-table-old-sessions`                 |
| Add column    | `add-<column>-to-<table> [type]`     | `add-phone-to-users string`               |
| Remove column | `remove-<column>-from-<table>`       | `remove-deleted-at-from-users`            |
| Rename column | `rename-<old>-to-<new>-in-<table>`   | `rename-user-id-to-customer-id-in-orders` |
| Change type   | `change-<column>-in-<table> [type]`  | `change-description-in-products text`     |
| Add index     | `add-index-<column>-to-<table>`      | `add-index-email-to-users`                |
| Remove index  | `remove-index-<column>-from-<table>` | `remove-index-status-from-orders`         |

---

## Important Notes

- **Node version:** Requires Node.js 18 or higher
- **Sequelize version:** Tested with Sequelize v6+ (should work with v7+)
- **Nullability in `create-table`:** Columns are NOT NULL by default (required for all rows)
- **Nullability in `add/change`:** Columns ARE NULL by default (optional, for existing rows)
- **Foreign keys:** Use CASCADE + SET NULL by default (safe defaults for most apps)
- **Column naming:** Use snake_case or camelCase — smart-migrate passes it through as-is
- **Type defaults:** If you don't specify a type in `add` or `change`, it defaults to `string`

---

## Troubleshooting

**Q: I got "Unknown type" error**

- Check your type spelling (e.g., `str` should be `string`, `int` should be `integer`)
- See "Supported Types" above for all valid options

**Q: My foreign key syntax isn't working**

- Use format: `columnName:ref:tableName[:keyName[:keyType]]`
- Example: `userId:ref:users` or `orgId:ref:organizations:id:uuid`

**Q: Migrations aren't running**

- Make sure you have `.sequelizerc` configured pointing to your migrations folder
- Run: `npx sequelize-cli db:migrate`

**Q: I need to add allowNull: true manually**

- Edit the generated migration file directly, or use `add` command (which includes `allowNull: true` by default)
