# sequelize-smart-migrate

Smart migration generator for Sequelize projects.

Generate migration files from human-readable names:

## Install

```bash
npm install -D sequelize-smart-migrate
```

## Usage

```bash
npx smart-migrate create add-email-to-users email:string
npx sequelize-cli db:migrate
```

## Supported Patterns

- add-<column>-to-<table>
- remove-<column>-from-<table>
- create-<table>
- rename-<old>-to-<new>-in-<table>
