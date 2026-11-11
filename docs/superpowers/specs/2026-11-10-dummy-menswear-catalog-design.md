# YAQANA Development Dummy Menswear Catalogue

## Intent

Populate the existing YAQANA development/staging storefront with a believable, clearly non-genuine 24-style men's catalogue so the current product and checkout experience can be tested before real merchandise is added. Preserve the existing visual design and protect all existing products, customer accounts, carts, and orders.

## Goals

- Insert 24 men's products across T-Shirts, Shirts, Trousers, Jeans, Hoodies, and Jackets.
- Add Jeans and Jackets categories without changing the existing four category records.
- Create three `DEV SAMPLE` collections.
- Use relevant, visually inspected, locally stored fashion images with a source and license manifest.
- Keep paise storage, INR presentation, detail pages, category navigation, search, sorting, colour/price/size filters, cart, and checkout compatible.
- Make seeding repeatable, insert-only, opt-in, and fail-closed outside the verified development/staging target.
- Identify every dummy product by a stable `dev-dummy-` slug prefix and document safe cleanup.

## Non-goals

- Changing the existing storefront design system or homepage layout.
- Adding schema fields just to mark dummy data.
- Modifying or running the old backend, changing deployment configuration, or connecting to production.
- Modifying/deleting existing genuine products, categories, collections, customers, carts, or orders.
- Claiming sample sizing, fabric provenance, stock, or commercial policies are genuine.

## Current state and constraints

- At design time, the existing backend `.env` reports `NODE_ENV=development`; a read-only database connection identified the remote replica-set database as `test`. The seeder must re-check both facts immediately before any write, print the target identity without credentials, and refuse any mismatch or `NODE_ENV=production`.
- Existing active categories are T-Shirts, Hoodies, Shirts, and Trousers. Their records must remain unchanged.
- Product prices are stored canonically as integer paise. Frontend legacy display values use a factor of 83 catalog units per INR; seed prices must be converted directly from rupees to paise (`rupees * 100`) and must not be multiplied by 83.
- The product schema has no dummy marker. Its unique slug is the marker; all seed slugs start `dev-dummy-`. Collections also use `DEV SAMPLE` names.
- Public catalog queries show active men's/unisex products. Search queries name, description, and category; backend supports category, collection, size, colour, price range, flags, and sorting.
- The existing Shop page hard-codes four category navigation links and currently exposes size and sort controls. It does not expose colour or price controls. Add only the requested category options and filter controls using the existing styling.
- Local image assets cover some shirts, tees, hoodies, and trousers, but do not provide unique, suitable product images for all 24 styles.

## Product assortment

All amounts are Indian rupees (regular price / sample development sale price). Every product is men's, active, has positive aggregate stock, and receives its own stable `dev-dummy-<kebab-slug>` identifier.

| Category | Product | Price / sale price |
|---|---|---:|
| T-Shirts | Essential Heavyweight Crewneck | ₹1,599 / ₹1,399 |
| T-Shirts | Compact Cotton Box Tee | ₹1,799 / ₹1,599 |
| T-Shirts | Washed Jersey Tee | ₹1,899 / ₹1,699 |
| T-Shirts | Textured Slub Tee | ₹1,699 / ₹1,499 |
| Shirts | Oxford Button-Down | ₹2,899 / ₹2,499 |
| Shirts | Linen-Blend Resort Shirt | ₹3,199 / ₹2,799 |
| Shirts | Micro-Check Cotton Shirt | ₹2,799 / ₹2,499 |
| Shirts | Chambray Overshirt | ₹3,299 / ₹2,899 |
| Trousers | Tapered Cotton Chino | ₹2,999 / ₹2,599 |
| Trousers | Relaxed Pleated Trouser | ₹3,499 / ₹3,099 |
| Trousers | Linen-Blend Drawstring Trouser | ₹2,799 / ₹2,399 |
| Trousers | Straight-Leg Tailored Trouser | ₹3,299 / ₹2,899 |
| Jeans | Indigo Straight Jean | ₹3,299 / ₹2,899 |
| Jeans | Mid-Wash Tapered Jean | ₹3,499 / ₹3,099 |
| Jeans | Charcoal Straight Jean | ₹3,599 / ₹3,199 |
| Jeans | Ecru Relaxed Jean | ₹3,799 / ₹3,399 |
| Hoodies | Brushed-Fleece Pullover | ₹3,499 / ₹3,099 |
| Hoodies | Zip-Front Fleece Hoodie | ₹3,999 / ₹3,599 |
| Hoodies | French-Terry Relaxed Hoodie | ₹3,299 / ₹2,899 |
| Hoodies | Heavyweight Tonal Hoodie | ₹4,299 / ₹3,799 |
| Jackets | Cotton-Twill Utility Jacket | ₹5,499 / ₹4,899 |
| Jackets | Lightweight Harrington Jacket | ₹5,999 / ₹5,299 |
| Jackets | Denim Trucker Jacket | ₹6,499 / ₹5,799 |
| Jackets | Quilted Liner Jacket | ₹6,999 / ₹6,299 |

Use apparel-appropriate sizes: XS–XXL for tops and outerwear; waist sizes 30, 32, 34, 36, and 38 for trousers and jeans. Include realistic descriptions, short descriptions, fabric/fit/care copy, color names and valid hex swatches, aggregate stock, at least one product-specific image, sample garment measurements in centimeters, and a collection assignment for every item. Product content and measurements are explicitly illustrative and must be described as development samples, not verified claims.

Create these collections insert-only:

- `DEV SAMPLE — Everyday Essentials`
- `DEV SAMPLE — Modern Tailoring`
- `DEV SAMPLE — Weekend Layers`

Assign tees to Everyday Essentials; shirts and trousers to Modern Tailoring; jeans, hoodies, and jackets to Weekend Layers.

## Data safety and repeatability

- Seed command is explicit and opt-in. It requires a development/non-production environment, actual MongoDB database name `test`, an exact user confirmation argument matching that name, a dedicated seed-enable environment flag, and `DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS` containing the exact comma-separated MongoDB seed host(s) from the configured URI (host and optional port only, never credentials). The preflight compares the configured URI seed host(s) and connected database name to the local allowlist, prints the target identity without credentials, and refuses production or any mismatch before writes.
- Category and collection writes use unique slugs/names and `$setOnInsert`; existing records are never updated.
- Product upserts key only on the unique `dev-dummy-` slug and use `$setOnInsert`; existing products, including any collision, are never overwritten. A collision whose current record does not match the intended dummy identity is reported and aborts rather than being silently adopted.
- Seed output reports inserted versus already-present rows and leaves all customer and order models untouched.
- A separate dry-run cleanup command lists only products with the `dev-dummy-` prefix and the exact `DEV SAMPLE` collection/category identifiers. It never removes categories or customers.
- For a confirmed cleanup operation, a dummy product referenced by any cart or historical order is archived (`active: false`) rather than deleted, preserving references/order snapshots. An unreferenced dummy product may be removed. Genuine products and cart/order documents are never deleted or edited. DEV SAMPLE collections are removed only after verifying no products reference them; Jeans and Jackets categories remain as reusable catalog taxonomy.

## Image strategy

- Obtain one unique, garment-matching editorial/product photograph for each style from a source whose license permits this local development storefront use. Prefer Pexels assets under the Pexels License; do not hotlink.
- Visually inspect each candidate for the relevant garment, men's fashion context, adequate resolution/crop, and absence of unrelated products or watermarks. Reject unverified or broken assets; do not substitute unrelated images.
- Store optimized local copies under `frontend/public/images/dev-products/` with stable filenames. Product documents use `/images/dev-products/<filename>` paths, which the existing image utility and product details can render.
- Keep a machine-readable manifest adjacent to the assets with product slug, local filename, source page URL, photographer/creator attribution, license name and URL, retrieval date, and SHA-256. Confirm source/license metadata for each file before seeding.
- Existing campaign/category images remain unchanged.

## Storefront behavior

- Add Jeans and Jackets to the existing category links on `frontend/src/pages/Shop.jsx`; link values must exactly match backend category names.
- Add colour and minimum/maximum INR price controls beside the current size/sort controls, retaining existing spacing, responsive behavior, and visual classes.
- Keep filters in URL query parameters so they combine with category, search, collection, size, and sorting and survive refresh/back navigation.
- Send INR bounds through the existing catalog-unit compatibility conversion. Backend filtering must use the effective displayed item price (`discountPricePaise` when present, otherwise `pricePaise`) so results match product cards.
- No homepage redesign or unrelated page/component redesign.

## Verification

- Unit tests cover exact 24-product data shape, all six categories, slug uniqueness/prefix, valid prices/sales, sizes/colors/images, and insert-only/safe-target rules.
- Seed dry-run prints target environment/database and proposed insert counts without writing.
- After explicit seeding, verify exactly 24 intended dummy products, both new categories, all three sample collections, and unchanged pre-existing category/product/customer/order counts or identities.
- API checks cover men-only catalog visibility, each category, product search, collection, colour, price bounds against discounted displayed price, size, sort, detail/related products, and image paths.
- Browser checks cover category navigation, search, sort, combined filters, product cards/detail/measurement gallery, cart add/update/remove, checkout order creation and stock decrement. Use disposable staging records and clean them afterward; never use production.
- Perform an image-load check on all 24 local image paths and a visual review of representative category/product pages.
- Run backend tests/syntax check and frontend tests/build after changes.

## Open implementation choices

- The builder may choose component-local filter state or URL-derived values as long as query params remain the source of truth and combined filters work.
- The builder may choose an image-optimization tool already available in the repository; do not add a dependency unless necessary.
- The owner chose a local exact-host allowlist for target verification; do not ask them to disclose host names or credentials in chat.
- The allowlist must be configured locally before any seed write. Re-confirm the connected database/environment and stop if the actual target cannot be positively identified as the authorized staging database.
