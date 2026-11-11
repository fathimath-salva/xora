# YAQANA Backend

A new backend being built to serve the **existing YAQANA React/Vite storefront while preserving its current design**. The old backend remains read-only reference material and is not used as the new production codebase.

## Current implementation status

This is an actively developing backend, not yet a production-ready release.

### Implemented in this build

- Node/Express API foundation, environment validation, MongoDB connection, CORS allowlist, Helmet, rate limiting and central error handling.
- Liveness and database-readiness endpoints.
- Email/password registration and login using Node's scrypt password hashing.
- Bearer-token authentication compatible with the existing `sessionStorage` token flow, backed by revocable server-side session records.
- Profile read/update, password change and logout/session revocation.
- Product listing/detail, search/filter/sort/pagination and admin product create/update/archive.
- Categories and collections, including admin management.
- Customer cart, guest-cart sync, wishlist and saved addresses.
- Checkout order creation with server-side product/price/stock lookup, MongoDB transaction, idempotency-key payload fingerprinting and order snapshots.
- Customer/admin order reads and guarded admin order-status transitions.
- Admin dashboard summary, customer listing/status controls.
- Admin image upload endpoint for local development.
- Bootstrap script for the first administrator account.

### Not yet complete / not approved for public launch

- Google sign-in, mobile OTP, email verification and password recovery.
- Admin MFA and granular staff/custom permissions.
- SKU-level stock records, inventory movement ledger and expiring stock reservations. Current checkout uses the legacy product-level stock field within a MongoDB transaction.
- Live payment gateway, signed gateway webhooks, payment reconciliation and refunds. Current checkout is test/mock only and never marks UPI orders as paid.
- Final COD deposit and eligibility rules. The current UI has no deposit flow, so COD is recorded in compatibility mode only.
- Courier integrations, live PIN-code serviceability, shipment labels/tracking and RTO automation.
- Returns/exchanges, QC quarantine and refund workflows.
- Promotions, wallet/loyalty, reviews, support tickets, newsletter consent and notification workers.
- Production cloud media storage/CDN. The current upload endpoint writes to local `uploads/` for development only.
- Full audit-log coverage, backup/restore drill, security review, load/concurrency suite and end-to-end browser tests.

## Requirements

- Node.js 22 or newer.
- MongoDB Atlas or a local MongoDB replica set. Checkout uses MongoDB transactions; a standalone local MongoDB server is not sufficient for that route.
- Dependencies installed with `npm install`.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to a MongoDB replica-set/Atlas URI. For local single-node development, start MongoDB with `--replSet rs0`, initialize the replica set once with `rs.initiate()` in `mongosh`, and keep `?replicaSet=rs0` in the connection URI.
3. Replace `JWT_SECRET` with a cryptographically random secret of at least 32 characters.
4. Keep `FRONTEND_ORIGINS=http://localhost:3000` for the current Vite development server.
5. Run `npm install`.
6. Run `npm run seed:categories` once to create the four existing storefront category records (insert-only; existing records are not overwritten).
7. Run `npm run dev`.
8. Check `GET http://localhost:5000/api/health/live` and `GET http://localhost:5000/api/health/ready`.

The frontend defaults to the relative `/api` path. Its Vite development server proxies `/api` and `/uploads` to `http://localhost:5000`. Set `VITE_API_BASE_URL` to the backend API base (for example, `https://<backend-origin>/api`) for a future deployment; keep `/api` for local development.

## Development-only dummy catalogue

The approved 24-product development sample catalogue is stored in `data/dev-products.json`. Its products use `dev-dummy-` slugs, local photos, integer paise prices, and the three `DEV SAMPLE` collections. Image source pages, contributor credits, Pexels License references, retrieval dates, and SHA-256 hashes are recorded in `frontend/public/images/dev-products/manifest.json`.

Do not use these commands against production. The seed command requires all of the following before connecting or writing:

- `NODE_ENV=development`.
- The connected MongoDB database name is exactly `test`.
- `DUMMY_CATALOG_SEED_ENABLED=true`.
- `DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS` is a comma-separated local allowlist of every exact MongoDB seed host (hostnames and optional ports only; no credentials).
- The explicit `--confirm-staging-database=test` argument.

Set the allowlist only in the local backend `.env`, matching the seed hosts in its `MONGODB_URI`; do not commit actual staging hostnames or credentials. The command checks the URI target before connecting, checks the connected database and host set again before writes, and prints the database/topology identity without credentials or hostnames. A missing or mismatched safeguard aborts.

Preview the insert-only operation first:

```bash
npm run seed:dummy-catalog -- --confirm-staging-database=test --dry-run
```

Only after reviewing the verified target and preview, run the seed:

```bash
npm run seed:dummy-catalog -- --confirm-staging-database=test
```

Products, categories, and collections use `$setOnInsert`. Existing records are never overwritten; a name/slug identity collision aborts before any writes. Re-running the command is idempotent. Product prices are seeded as `INR * 100` paise; the storefront's legacy factor of 83 is not used for storage.

The cleanup command is read-only by default and selects only `dev-dummy-` products in the exact `DEV SAMPLE` collections. Review its output:

```bash
npm run remove:dummy-catalog -- --confirm-staging-database=test
```

Applying cleanup requires adding `--apply` and the same exact staging confirmation. Products referenced by a cart, wishlist, or historical order are archived; only unreferenced dummy products may be deleted. A `DEV SAMPLE` collection is removed only when no products use it. The cleanup command never removes categories or edits/deletes customers, carts, wishlists, or orders. Do not apply cleanup without a separate, deliberate review.

## Create the first administrator

Set temporary `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (minimum 12 characters) and optional `BOOTSTRAP_ADMIN_NAME` environment variables, then run:

```bash
npm run create-admin
```

The script refuses to elevate an existing account. Remove the temporary bootstrap password from the environment after use. Admin MFA is still a required pre-production task.

## Compatibility notes

- The current frontend sends bearer JWTs from `sessionStorage`; the backend supports that exact contract for now. Session records allow logout/password-change revocation. Migrating to HttpOnly cookies will require a later coordinated frontend change.
- The current storefront's `formatInr()` converts legacy catalogue units using a factor of 83. The backend stores canonical amounts as integer paise and returns both `*Paise` fields and temporary legacy display fields (`price`, `subtotal`, `total`, etc.) so the unchanged frontend continues to render correctly.
- The frontend currently calculates shipping/tax using legacy values. Matching defaults are configurable in `.env` and are temporary compatibility settings, not approved final YAQANA commercial/tax policy.
- The checkout page explicitly describes UPI as mock/test only. The backend therefore records payment as `Pending` and does not claim that a payment was processed.

See `FRONTEND_COMPATIBILITY.md` for the audited endpoint contract and known conflicts.

## Security and operations

Never commit `.env`, payment credentials or customer data. Do not connect live gateway credentials until merchant onboarding, gateway selection, signed webhooks, idempotency and reconciliation have been reviewed and tested. Do not deploy local-disk uploads as durable production media storage.
