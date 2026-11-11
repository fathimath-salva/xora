# YAQANA backend implementation status

**Working rule:** The existing frontend is frozen during this backend phase. Do not edit its design, pages, components, contexts, routing or Axios services. The new backend adapts to the API contract found in the existing source. The old backend remains read-only reference material.

## Implemented API groups

- `/api/health`
- `/api/auth`
- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/wishlist`
- `/api/addresses`
- `/api/orders`
- `/api/admin`
- `/api/upload`
- Static `/uploads/*` for development media

## Important compatibility decisions

| Existing frontend contract | Backend approach in this phase |
|---|---|
| Bearer token in `sessionStorage` | Accept bearer tokens; persist revocable session records; revoke on logout/password change. HttpOnly cookie migration is deferred until frontend integration changes are approved. |
| Product prices are legacy catalogue units; `formatInr()` multiplies by 83 | Store paise internally. Return canonical `pricePaise`/`*Paise` values and compatibility aliases expected by current components. |
| Current shipping threshold/fee/tax calculations | Use configurable compatibility defaults matching the current storefront; do not treat these as final commercial or tax policy. |
| UPI checkout says mock/test only | Create an order with payment status `Pending`; do not mark payment as received. No gateway is connected. |
| COD has no deposit step in the current checkout UI | Record the chosen COD method for compatibility only. Deposit, eligibility and refusal controls remain unimplemented and COD is not production-ready. |
| Frontend exposes global product stock, not size-colour SKU stock | Use current product-level stock for the compatibility checkout. SKU-level inventory and reservation lifecycle require a later agreed frontend/API phase. |
| Guest cart is local; it syncs after login | Preserve the current flow. Sync uses the existing-cart/guest-cart maximum-quantity merge policy and revalidates stock. |

## Remaining implementation work

### Priority next

1. Install dependencies in an environment with npm registry access and create a committed lockfile.
2. Connect a development MongoDB replica set/Atlas database and run migrations/index creation.
3. Execute HTTP integration tests against the actual frontend for every mounted route.
4. Verify the current product catalogue and import only approved real catalogue data; do not seed invented products.
5. Add database-backed audit logs for admin/product/inventory/customer operations.
6. Add inventory movement records and then SKU-level inventory when the frontend contract is ready.
7. Implement payment provider abstraction, provider selection, signed raw-body webhooks, idempotent fulfillment and reconciliation.
8. Implement COD deposit lifecycle after owner decisions and frontend support.
9. Implement returns, exchanges, refunds, shipping/courier integration and delivery/RTO workflow.
10. Add Google login, OTP, email verification, password recovery and admin MFA.
11. Replace local upload storage with approved object storage/CDN before production.
12. Add automated end-to-end, security, concurrency, load and backup-restore tests.

## Validation performed in this environment

- JavaScript syntax check passed for all 43 backend source/script/test files.
- Four Node tests passed: slug utility, HTTP error helper, password hash verification and initial route smoke check.
- The password hashing test uses Node's built-in scrypt implementation.
- Dependency installation could not be completed because this environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`). No `node_modules` or package lock was produced.
- MongoDB was not connected, so no API/database integration or transaction test has been performed.
- The frontend archive was only extracted into a separate audit folder for inspection. The original `xora-main.zip` was not edited.

**This build is an implementation starting point and is not yet runtime-verified or production-ready.**
