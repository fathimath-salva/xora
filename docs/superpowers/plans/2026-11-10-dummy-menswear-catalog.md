# YAQANA Dummy Menswear Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, repeatable 24-product development catalogue and compatible Shop category, colour, and INR-price filters, then verify the storefront without touching production or genuine data.

**Architecture:** Keep product data, image provenance, and seeding/cleanup operations in the new backend; use insert-only MongoDB upserts keyed by the existing `dev-dummy-` slug marker. Extend the existing Shop page and backend catalog query to filter by the product's effective displayed price and colour, leaving the storefront design system intact.

**Tech Stack:** Existing Express 5, Mongoose 8, Node test runner, React 18, Vite 6, React Router 6, MongoDB, and local public image assets; do not add dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-dummy-menswear-catalog-design.md`

## Global Constraints

- Create exactly 24 proposed men's products across T-Shirts, Shirts, Trousers, Jeans, Hoodies, and Jackets.
- Add Jeans and Jackets insert-only; do not modify existing categories.
- Create the three proposed `DEV SAMPLE` collections insert-only.
- Every dummy product slug starts with `dev-dummy-`; seed uses `$setOnInsert` and never overwrites products.
- Store INR prices as integer paise (`rupees * 100`); do not apply the frontend factor of 83 during seeding.
- Use visually checked, garment-relevant, locally stored images and record source/license metadata plus SHA-256 in a manifest.
- Preserve the existing storefront design; only add the approved category links and colour/price filters.
- Never modify existing genuine products, customers, carts, or orders; never access production, change deployment settings, or modify the old backend.
- Before any seed write, require non-production `NODE_ENV`, actual database name `test`, `--confirm-staging-database=test`, `DUMMY_CATALOG_SEED_ENABLED=true`, and an exact local `DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS` allowlist match. Stop if any check is missing or fails.
- Do not run seeding until the owner configures the two local staging safeguards that are currently absent.

## Review Focus

- Wrong remote Mongo host with the same database name: test that missing or mismatched host allowlists block before any write.
- A `dev-dummy-` slug colliding with an existing non-dummy product: test that the seeder aborts without updating it.
- Sale price differs from regular price: test that min/max filters match the price displayed by cards.
- Combined colour/category/size/price/search filters and URL refresh: verify all constraints compose rather than replacing each other.
- Dummy products referenced by a cart or order: test cleanup archives them and does not delete or mutate the cart/order.

---

### Task 1: Filter by effective displayed price on the backend

**Files:**
- Create: `yaqana-backend/src/utils/effectivePriceFilter.js`
- Modify: `yaqana-backend/src/controllers/catalogController.js`
- Create: `yaqana-backend/tests/effectivePriceFilter.test.js`

**Interfaces:**
- Produces: `buildEffectivePriceFilter(minPricePaise, maxPricePaise)` returns a MongoDB `$expr` predicate using `discountPricePaise` when non-null, otherwise `pricePaise`.
- Consumes: `parseMoneyPaise` and the existing catalog-unit API query contract in `catalogController.js`.

- [ ] **Step 1: Write the failing unit tests**

Add tests proving the helper:
- Applies a lower bound to the effective sale price when one exists.
- Falls back to regular price when sale price is `null`.
- Applies an upper bound and both bounds together.
- Returns no predicate when neither bound is supplied.

- [ ] **Step 2: Run the targeted tests and verify failure**

Run: `node --test tests/effectivePriceFilter.test.js` from `yaqana-backend`.
Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement and connect the effective-price predicate**

Create `buildEffectivePriceFilter(minPricePaise, maxPricePaise)` and add its predicate to the existing product query without replacing category, search, collection, size, colour, or visibility conditions.

- [ ] **Step 4: Run targeted and backend tests**

Run: `node --test tests/effectivePriceFilter.test.js` and `npm test` from `yaqana-backend`.
Expected: all tests pass, including the new sale-price and null-sale-price cases.

### Task 2: Add Shop category, colour, and INR price filters

**Files:**
- Modify: `frontend/src/pages/Shop.jsx`
- Create: `frontend/src/utils/shopFilters.js`
- Create: `frontend/tests/shopFilters.test.js`
- Modify: `yaqana-backend/src/controllers/catalogController.js` only if Task 1 integration exposes an API contract mismatch.

**Interfaces:**
- Produces: `buildShopApiParams({ search, category, collection, size, colour, minPriceRupees, maxPriceRupees, sort, filter })` returns the existing API query keys; INR bounds are converted with `rupeesToCatalogUnits`.
- Consumes: `buildEffectivePriceFilter` from Task 1 and existing `updateShopParam` URL-query behavior.

- [ ] **Step 1: Write failing utility tests**

Test exact category and colour values, omitted empty filters, preserved search/sort/size/collection values, and INR-to-catalog-unit conversions for both bounds.

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/shopFilters.test.js` from `frontend`.
Expected: FAIL because `shopFilters.js` does not exist.

- [ ] **Step 3: Implement the parameter builder and Shop controls**

Add Jeans and Jackets to `CATEGORY_SLUGS`. Add controlled colour, minimum INR, and maximum INR inputs represented in URL parameters. Use the utility when building API requests. Preserve existing responsive layout, CSS utility classes, size/sort controls, and filter reset behavior.

- [ ] **Step 4: Verify utility tests, frontend tests, and build**

Run from `frontend`: `node --test` and `npm run build`.
Expected: all tests pass and Vite reports a successful production build.

### Task 3: Acquire and validate local fashion images

**Files:**
- Create: `frontend/public/images/dev-products/` containing 24 stable local image files
- Create: `frontend/public/images/dev-products/manifest.json`
- Create: `yaqana-backend/tests/devProductImageManifest.test.js`

**Interfaces:**
- Produces: one manifest entry per `dev-dummy-` product containing local file, source page URL, photographer/creator, license name/URL, retrieval date, and SHA-256.
- Consumes: the exact product slugs and assortment in the design spec.

- [ ] **Step 1: Write the failing manifest tests**

Assert there are exactly 24 unique product slug entries with local paths, source/license metadata, non-empty creators, and existing image files whose computed SHA-256 matches the manifest.

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/devProductImageManifest.test.js` from `yaqana-backend`.
Expected: FAIL because the manifest and image set do not exist.

- [ ] **Step 3: Acquire, visually inspect, and store the images**

Use one garment-matching, high-resolution Pexels-licensed image per style; inspect each candidate and confirm product relevance/license/source metadata before downloading. Store local optimized copies under stable names in `frontend/public/images/dev-products/`. Do not hotlink or use unrelated images.

- [ ] **Step 4: Write the provenance manifest and pass validation**

Record source and license information for every file and calculate its SHA-256. Run the manifest test.
Expected: exactly 24 unique, present files with matching hashes and complete provenance.

### Task 4: Add the insert-only seed and safe cleanup commands

**Files:**
- Create: `yaqana-backend/data/dev-products.json`
- Create: `yaqana-backend/src/utils/dummyCatalogSeed.js`
- Create: `yaqana-backend/scripts/seedDummyCatalog.js`
- Create: `yaqana-backend/scripts/removeDummyCatalog.js`
- Create: `yaqana-backend/tests/dummyCatalogSeed.test.js`
- Modify: `yaqana-backend/package.json`
- Modify: `yaqana-backend/.env.example`
- Modify: `yaqana-backend/README.md`

**Interfaces:**
- Produces: `validateDummyCatalogTarget({ nodeEnvironment, databaseName, confirmation, enabled, expectedHosts, actualHosts })` throws before writes on any missing/mismatched safety gate.
- Produces: a 24-record JSON catalogue with backend-native `pricePaise` and `discountPricePaise`, local `/images/dev-products/...` paths, valid categories, colors, sizes, stock, measurements, and product detail copy.
- Consumes: the verified image manifest from Task 3 and existing Category, Collection, Product, Cart, and Order models.

- [ ] **Step 1: Write failing tests for data and safety**

Assert 24 unique prefixed slugs, six categories, exact prices in paise, valid sale-price relationships, three collection names, image-manifest correspondence, and rejection of production/missing/wrong database, confirmation, enable flag, or host allowlist. Assert a slug collision with a genuine product causes an abort without an update.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/dummyCatalogSeed.test.js` from `yaqana-backend`.
Expected: FAIL because the data and target-validation helper do not exist.

- [ ] **Step 3: Implement data validation and insert-only writes**

Use `$setOnInsert` for new categories, collections, and products. Preserve existing records. Convert listed rupee prices directly to paise (`* 100`). Require all safety gates and verify the connected database identity before any write.

- [ ] **Step 4: Implement safe dry-run cleanup**

Default cleanup to dry-run and list only exact `dev-dummy-` product slugs and the exact `DEV SAMPLE` collections. Require explicit `--apply` plus an exact database confirmation for mutation. Archive referenced dummy products; delete only unreferenced dummy products; remove sample collections only when no products use them. Never remove Jeans/Jackets categories or edit cart/order documents.

- [ ] **Step 5: Register commands and document safe staging setup**

Add `seed:dummy-catalog` and `remove:dummy-catalog` scripts. Document the local `DUMMY_CATALOG_SEED_ENABLED=true`, exact `DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS` format, and command `--confirm-staging-database=test`. Do not add these values to production configuration.

- [ ] **Step 6: Run tests, syntax check, and dry-run**

Run `node --test tests/dummyCatalogSeed.test.js`, `npm test`, and `npm run check` from `yaqana-backend`. Run the seed dry-run only after safeguards exist and verify it prints the expected database/host identity and 24 product/2 category/3 collection counts without modifying data.

### Task 5: Populate the authorized staging database and verify the storefront

**Files:**
- No new implementation files; use the commands and interfaces from Tasks 1–4.
- Test disposable staging customer/order data only, then remove those temporary records.

**Interfaces:**
- Consumes: approved seed command, verified staging host allowlist, product data, local image manifest, API filter behavior, and cleanup dry-run.
- Produces: 24 active dummy products, 2 new categories, 3 DEV SAMPLE collections, and a verification report.

- [ ] **Step 1: Re-confirm the target read-only immediately before seeding**

Connect using the configured local environment and print only `NODE_ENV`, database name, host allowlist match, and topology type. Require `NODE_ENV=development`, database `test`, exact host allowlist match, and explicit local seed opt-in. If the allowlist is missing or mismatched, stop without writes.

- [ ] **Step 2: Record baseline identities/counts and run seed once**

Read and retain existing category/product/customer/order identities and counts. Invoke only the confirmed staging seed command. Verify insert-only counts and that existing identities/documents are unchanged.

- [ ] **Step 3: Run the seed a second time and verify idempotence**

Run the same explicit command again. Verify it inserts no duplicate products, categories, or collections and does not change existing dummy records.

- [ ] **Step 4: Verify API behavior and local images**

Check all six category filters, name search, size/colour filters, category+colour+price combinations, ascending/descending price and newest sorts, and product details/related items. Verify each product price displayed in the browser matches its INR seed amount and all 24 local image URLs return successfully.

- [ ] **Step 5: Verify cart and checkout with a disposable staging customer**

Add a dummy product to cart, update quantity, complete a test checkout, verify order item/price and stock decrement, then remove only the disposable customer's test orders, cart, wishlist, addresses, sessions, user, and any remaining test product references. Do not modify real customer/order data.

- [ ] **Step 6: Verify cleanup safeguards without applying cleanup**

Run cleanup dry-run. Verify it identifies only the 24 `dev-dummy-` slugs and exact DEV SAMPLE collections; do not execute cleanup with `--apply`. Confirm no genuine product, category, customer, cart, or order is included.

- [ ] **Step 7: Run final automated checks**

Run backend `npm test` and `npm run check`; frontend `node --test` and `npm run build`.
Expected: all tests pass, syntax check passes, build completes, all staged product images load, and the final database contains exactly the intended catalogue additions with temporary checkout data removed.
