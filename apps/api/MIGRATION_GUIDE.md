# Database Migration Guide

## 1. Where to Run Commands

**IMPORTANT:** You must run all migration commands inside the `apps/api` directory.

```bash
cd apps/api
```

## 2. Migration Commands

### Create a New Migration

Use this when you have changed your entities (e.g., added a column to `User` entity) and want to generate the SQL to update the database.

```bash
# Usage: npm run migration:generate -- src/migrations/MigrationName
npm run migration:generate -- src/migrations/UpdateUserTable
```

### Run Pending Migrations

Use this to apply the generated migration files to your actual PostgreSQL database.

```bash
npm run migration:run
```

### Revert Last Migration

Use this if you made a mistake and want to undo the last applied migration.

```bash
npm run migration:revert
```

## 3. File Locations

- **Migration Files**: `apps/api/src/migrations/`
  - This is where the generated `.ts` files are stored.
- **Database Config**: `apps/api/src/data-source.ts`
  - Configurations for TypeORM.
- **Environment config**: `apps/api/.env`
  - Database credentials (`DB_PASSWORD`, `DB_USERNAME`, etc.).
