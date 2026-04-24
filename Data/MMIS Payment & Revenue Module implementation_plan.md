# MMIS Payment & Revenue Module Implementation Plan

This plan outlines the architecture and execution steps for a production-grade payment and revenue tracking system for the Market Master Information System (MMIS). It integrates **Flutterwave** for Mobile Money collections and **URA EFRIS** for automated fiscal receipting.

## User Review Required

> [!IMPORTANT]
> **URA S2S Certificates**: Please ensure that the production `.pfx` certificate is provided and the password is securely stored in the environment variables.
> **Flutterwave Webhooks**: The webhook URL `{{APP_URL}}/api/v1/payments/webhook` must be configured in the Flutterwave dashboard with the correct secret hash.

## Proposed Changes

### Backend Infrastructure (MarketMasterApi)

#### [MODIFY] [schema.prisma](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/prisma/schema.prisma)
- Ensure `Transaction` model includes:
    - `gatewayReference`: External ID from Flutterwave.
    - `efrisReceiptId`: Official URA receipt number.
    - `efrisVerificationCode`: Code for QR verification.
    - `status`: Transitions: `INITIATED` -> `SUCCESS`/`FAILED` -> `EFRIS_SYNCED`.

#### [MODIFY] [flutterwave.service.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/services/flutterwave.service.js)
- Finalize `initiateMomoPayment` with environment-specific base URLs.
- Implement `verifyTransaction` for manual fallback/polling.
- Enforce `timingSafeEqual` in `validateWebhookSignature`.

#### [MODIFY] [efris.service.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/services/efris.service.js)
- Integrate `ura-efris-js-sdk` for communication.
- Implement full T101 (B2B/B2C) XML serialization logic.
- Configure BullMQ with exponential backoff (e.g., 5 attempts starting at 10s).

#### [NEW] [totp.middleware.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/middleware/totp.middleware.js)
- Middleware to intercept sensitive requests (Manual Rent Record, Refunds) and verify the `x-totp-code` header.

### Frontend Enhancements (MarketMasterERP)

#### [NEW] Financials Feature Folder
- Create `src/features/financials` with centralized services and types.

#### [NEW] Vendor Checkout Flow
- **Component**: `MomoPaymentModal` - Allows vendors to select amount/network and trigger USSD push.
- **Polling**: Implement a clean polling loop with a 60s timeout while waiting for webhook confirmation.

#### [NEW] Receipt Rendering
- **Component**: `FiscalReceiptViewer` - Renders the official URA QR code and receipt metadata fetched from the transaction record.

---

## Verification Plan

### Automated Tests
- **Unit Tests**: Test payload serialization logic for EFRIS T101 format.
- **Integration Tests**: Mock Flutterwave webhook delivery to verify status transitions.
- **Background Jobs**: Test BullMQ job failure and retry logic with mock URA downtime.

### Manual Verification (Sandbox)
1.  **MoMo Flow**: Initiate payment via `test_payment_flow.js`, respond to mock USSD, and verify DB update.
2.  **EFRIS Sync**: Trigger `simulate_efris_sync.js`, check BullMQ dashboard, and verify receipt ID in DB.
3.  **Security**: Attempt manual rent recording without a valid TOTP and ensure 403 rejection.
