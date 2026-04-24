# Payment & Revenue Module Execution Tasks

## 1. Database & Schema Alignment
- `[x]` Modify `schema.prisma` `Transaction` model.
  - `[x]` Add `gatewayReference` (String?).
  - `[x]` Add `efrisReceiptId` (String?).
  - `[x]` Add `efrisVerificationCode` (String?).
  - `[x]` Ensure `paymentStatus` enum/string handles `INITIATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `EFRIS_SYNC_PENDING`.
- `[x]` Run `prisma generate` to update types.
- `[x]` Execute `prisma migrate dev` with name `add_payment_gateway_efris_fields`.

## 2. Flutterwave (MTN MoMo) Integration
- `[x]` Scaffold `FlutterwaveService` in `src/services/flutterwave.service.js`.
- `[x]` Implement `POST /api/v1/payments/checkout/momo` in `payment.controller.js`.
- `[x]` Implement `POST /api/v1/payments/webhook/flutterwave` listener.
  - `[x]` Add Webhook signature validation.
  - `[x]` Wire status updates back to the `Transaction` record.

## 3. URA EFRIS S2S Engine
- `[x]` Scaffold `EfrisAggregatorService` in `src/services/efris.service.js`.
- `[x]` Implement XML/JSON payload serializers for Tax/Rent payments (Schema stubs created).
- `[x]` Set up a transaction listener/queue (BullMQ) for async background syncing upon a `SUCCESS` transaction.
- `[x]` Implement the S2S HTTP Client with local `.pfx` certificate loading capabilities (Scaffolded with stubbed signing).

## 4. Admin EFRIS & Payment APIs
- `[x]` Create `GET /api/v1/payments/efris/status` for monitoring stats.
- `[x]` Create `POST /api/v1/payments/efris/retry-all` manual fail-safe.
- `[x]` Implement TOTP validation middleware for Admin Refund / Withdrawal paths.

## 5. Vendor Dashboard Lookups
- `[x]` Implement `GET /api/v1/payments/vendor/:vendorId/rent` enhanced with QR extraction mappings.
- `[x]` Validate multi-tenant JWT scoping for all the above endpoints.
- `[x]` Run Local Sandbox validation tests matching the Verification plan.

