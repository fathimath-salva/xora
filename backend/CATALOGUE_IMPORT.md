# Additive men's catalogue importer

The importer reads the four required men's categories and 20 products from `src/utils/seedData.js`. It creates only missing required Category and Product documents in the selected database. It never writes Collections, Users, or Orders. Existing products are matched by normalized product name and gender and are never updated. Existing categories must already be active and exactly match the required name/slug pair; otherwise the importer stops without writing. New records use insert-only `$setOnInsert` upserts.

## Requirements and safeguards

- Run from `backend/` with dependencies installed.
- `MONGODB_URI` must be available in the process environment or in `backend/.env`. The URI is not printed.
- Always provide the target database as `--database <name>`. The importer checks the URI database before connecting and checks the connected database again afterward. It does not use the backend's development fallback.
- A pathless URI is accepted only for a read-only dry run explicitly targeting the confirmed demo database `test`. The importer constructs a temporary URI with `/test`; it does not rely on the MongoDB driver's default database. Apply mode still requires the configured URI itself to explicitly name the requested database.
- Omitting `--apply` runs a read-only dry run. `--apply` is required for writes.
- Every category and seed record is validated before any writes. Any validation failure, inactive required category, or duplicate intended category/product aborts the run.
- Apply mode uses an exclusive lock file in the operating system temporary directory to prevent concurrent runs on the same machine. A forced process termination can leave a stale lock; verify no importer is running before removing the lock file named in the error.

## Commands

From `backend/`, to inspect the confirmed Atlas demo database `test` when the configured URI has no database path:

```powershell
npm run import:catalogue -- --database test
```

This command is read-only. It explicitly targets `test`, validates all four categories and 20 seed products, checks the connected database name, and reports current/product-category counts, projected category/product inserts, and existing matching products.

Run it only in the approved environment whose `MONGODB_URI` points to the Atlas demo cluster. Do not run it using the local `xora_ecommerce` environment; the target check will fail without reading or writing products.

Apply mode remains intentionally stricter: do not use it while the configured URI has no database path. An approved future apply requires an explicit URI path that matches `--database test` and a separate `--apply` flag.

The output reports the selected database name, pre-import counts, inserted/already-present counts, and post-import counts by catalogue category. Dry-run post-import counts are clearly marked as projections. The importer does not print the URI or credentials.

## Admin API alternative for Render Free

When the deployed backend is on Render Free, its environment cannot run one-off jobs or shell commands. Use the reviewed local API client instead, after signing in with an existing YAQANA administrator account. It targets only the deployed YAQANA API, keeps the returned access token in memory, and prompts for the password without echoing it. It does not use a database URI.

From `backend/`:

```powershell
npm run import:catalogue:api
```

This is a dry run. It authenticates with the existing `/api/auth/login` endpoint, reads `/api/categories` and every `/api/products` page, validates the four categories and 20 products, then prints the planned category/product creations. It sends no category or product write request.

The optional write mode is intentionally separate and requires both a separate approval and an interactive `APPLY` confirmation after reviewing the dry-run report. It uses only the existing admin-protected category and product endpoints.

## Read-only check of production Category documents

Use MongoDB Atlas Data Explorer with a read-only database user, select the intended database, open its `categories` collection, and run a read-only filter for the four customer catalogue slugs:

```javascript
db.categories.find(
  { slug: { $in: ['t-shirts', 'hoodies', 'shirts', 'trousers'] } },
  { _id: 0, name: 1, slug: 1, active: 1, gender: 1 }
).toArray()
```

Do not use an update, insert, delete, or shell seeder command for this check. The product API filters by the product's string `category`; category navigation is separately backed by Category documents. Collection discovery is separately backed by Collection documents.
