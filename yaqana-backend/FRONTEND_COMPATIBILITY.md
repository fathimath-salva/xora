# YAQANA frontend and new-backend compatibility

**Source inspected:** The current workspace frontend, including `frontend/src/services/api.js`, `AuthContext.jsx`, `CartContext.jsx`, `WishlistContext.jsx`, checkout/order pages, the existing admin dashboard, currency utility and Vite config.

## Confirmed frontend conventions

- Axios uses `VITE_API_BASE_URL`, defaulting to the relative `/api` path.
- Vite runs on port `3000` and proxies `/api` and `/uploads` to `http://localhost:5000`.
- Most frontend services expect JSON with `success: true` and named data fields.
- Authentication sends `Authorization: Bearer <token>` from `sessionStorage` key `xora_token`.
- Login/register responses are consumed as `{ success, token, user }`.
- Product cards and pages consume legacy product fields including `price`, `discountPrice`, `images`, `sizes`, `colours`, `stock`, `category`, `collection` and flags.
- `formatInr()` converts legacy catalogue units to rupees by multiplying by **83**. These product `price` fields are not plain rupees.
- Checkout sends `{ items, shippingAddress, paymentMethod, notes }` and an `Idempotency-Key` header. Item records include browser-supplied product/name/image/price/quantity/size/colour. The backend must ignore browser-supplied names, images and prices for authoritative calculations.
- The checkout page explicitly states that UPI is mock/test only and no payment gateway is connected.
- The frontend's current cart calculations use a free-shipping threshold of 200 catalogue units, a shipping fee of 15 catalogue units below that threshold and estimated tax of 8%.
- Uploaded `/uploads/*` product images resolve against the configured backend origin when `VITE_API_BASE_URL` is absolute. Storefront `/images/*` assets remain same-origin.
- The admin dashboard uses the backend customer statuses `active`/`blocked` and order transition options returned by the admin order-list API.

## Existing endpoint contract

| Method | Path | Expected frontend data |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }`; response `{ success, token, user }` |
| POST | `/api/auth/register` | `{ name, email, password, confirmPassword }`; response `{ success, token, user }` |
| GET | `/api/auth/profile` | `{ success, user }` |
| PUT | `/api/auth/profile` | `{ name, phone }` |
| PUT | `/api/auth/change-password` | Existing password form payload |
| POST | `/api/auth/logout` | Current bearer token |
| GET | `/api/products` | Query params for search, gender, pagination, sorting and filters; response includes `products`, count and pagination metadata |
| GET | `/api/products/:id` | `{ success, product, relatedProducts }` |
| GET | `/api/products/collections` | `{ success, collections, collectionRecords }` |
| POST/PUT/DELETE | `/api/products` and `/api/products/:id` | Admin product CRUD/archive |
| POST/PUT/DELETE | `/api/products/collections...` | Admin collection management |
| GET | `/api/categories` | `{ success, categories }` |
| POST/PUT/DELETE | `/api/categories...` | Admin category management |
| GET | `/api/cart` | `{ success, cart: { items } }`; each item includes populated `product` |
| POST | `/api/cart` | `{ productId, size, colour, quantity }` |
| PUT | `/api/cart/update` | `{ itemId, quantity }` |
| DELETE | `/api/cart/:itemId` | Remove cart item |
| POST | `/api/cart/sync` | `{ items: [{ productId, size, colour, quantity }] }` |
| GET | `/api/wishlist` | `{ success, wishlist }` |
| POST | `/api/wishlist` | `{ productId }`; toggles wishlist membership |
| GET/POST | `/api/addresses` | List/create saved addresses |
| PUT/DELETE | `/api/addresses/:id` | Update/delete saved address |
| PUT | `/api/addresses/:id/default` | Set default address |
| POST | `/api/orders` | Checkout payload + `Idempotency-Key`; response `{ success, order }` |
| GET | `/api/orders/my-orders` | Customer order history |
| GET | `/api/orders/:id` | Customer order detail |
| GET | `/api/orders` | Admin order list with query params; each order includes `allowedNextStatuses` |
| PUT | `/api/orders/:id` | Admin order status update |
| GET | `/api/admin/stats` | Dashboard stats, chart data and category distribution |
| GET | `/api/admin/customers` | Customer list |
| PUT | `/api/admin/customers/:id/status` | `{ status }` |
| POST | `/api/upload` | Multipart field `image`; response `{ success, imageUrl }` |

## Current backend implementation coverage

Implemented in the current backend source: auth email/password routes, product/category/collection routes, cart, wishlist, address, order, admin stats/customer routes and local image upload route. The existing admin page now consumes the new backend's status contracts, supports image upload, category archiving and admin profile/password changes. Automated frontend helper tests, backend unit tests and syntax checks do not replace runtime integration with a connected MongoDB replica set.

## Compatibility adapters and known conflicts

1. **Bearer token vs HttpOnly cookie:** The current frontend explicitly stores a bearer token in `sessionStorage`. The backend accepts that contract and maintains revocable server-side sessions. This remains a browser-storage security tradeoff; moving to HttpOnly cookies/CSRF would require a coordinated auth change.
2. **Money units:** The frontend's `formatInr()` multiplies legacy catalogue units by 83. Backend records use integer paise. Responses include canonical `pricePaise`, `subtotalPaise`, etc., plus legacy display aliases consumed by the unchanged UI. Product admin form values are interpreted as legacy catalogue units during this compatibility phase.
3. **Shipping/tax:** Backend defaults mirror current frontend values for order consistency. These are temporary settings and must not be treated as approved final YAQANA shipping/tax policy.
4. **Mock payments:** UPI options are currently test/mock only. The backend records pending payment and never marks a mock UPI payment as paid.
5. **COD:** The frontend has no COD deposit UI. The current backend can record the selected COD method for compatibility, but the agreed deposit/eligibility lifecycle is not implemented and COD is not production-ready.
6. **Inventory:** Current product-level stock is checked and decremented transactionally at order creation to match the existing checkout. SKU-level inventory, reservation expiry, returned-stock quarantine and full movement ledger remain to be implemented.
7. **Authentication enhancements:** Google login, mobile OTP, email verification, password recovery and mandatory admin MFA are not yet implemented.
8. **Media:** `/uploads` is local-disk development storage only. Production must move to durable object storage/CDN.

## Frontend preservation rule

Keep the existing storefront design, routing, cart, wishlist, checkout and responsive behavior. Admin integration should reuse `frontend/src/pages/AdminDashboardPage.jsx`; do not create a duplicate dashboard. The Vercel `/api` rewrite still points at the legacy deployment until the new backend and frontend have been independently verified and a complete old-backend backup has been created. No production API origin has been supplied; local/staging uses `/api` through the Vite proxy, and a future deployment must set `VITE_API_BASE_URL` to the new backend's `/api` origin.
