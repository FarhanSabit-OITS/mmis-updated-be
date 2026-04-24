# Technical Standards & Architecture Deep-Dive

This document elaborates on the core architectural pillars and industry standards proposed for the MarketMaster MMIS platform.

---

## 1. Declarative Schema Validation (Zod)

### **The Problem: Imperative Validation**
Currently, validation is scattered across controllers using manual `if/else` checks and regex utilities. This leads to:
- **Boilerplate**: Repetitive checks in every route.
- **Inconsistency**: Different error messages for the same field across endpoints.
- **Lack of Type Safety**: Controllers don't know the exact "shape" of `req.body` without manual casting.

### **The Solution: Zod Middleware**
By moving to **Zod**, we define the "Source of Truth" for data shape in one place and use it as Express middleware.

#### **Example: Registration Schema**
```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    businessName: z.string().min(2, "Business name is too short"),
    role: z.enum(['VENDOR', 'SUPPLIER', 'MEMBER']),
  })
});
```

#### **How it works at the Route level:**
```javascript
// routes/auth.routes.js
router.post('/register', validate(RegisterSchema), authController.register);
```
**Benefits**:
- **Automatic Rejection**: If the email is invalid, the controller is never even reached.
- **Unified Errors**: Frontend receives a standardized JSON object of all errors at once.
- **Type Inference**: We can export `type RegisterDTO = z.infer<typeof RegisterSchema>`.

---

## 2. Payment Idempotency (Flutterwave Webhooks)

### **What is Idempotency?**
An idempotent operation is one that can be performed multiple times without changing the result beyond the initial application. In payments, this prevents **Double Billing**.

### **Current Implementation**
You currently have a safety check in `PaymentService.js`:
```javascript
if (transaction.status === 'SUCCESS' || transaction.status === 'COMPLETED') {
  return { status: 'already_processed' };
}
```

### **Recommended Enhancements**
To reach industry-standard "Zero-Failure" idempotency:

1. **Unique Constraints**: Ensure `gatewayReference` (from Flutterwave) is a unique index in the database.
2. **Atomic Status Machine**: Instead of just checking status, use a state transition query:
   ```javascript
   // Only update if it's currently INITIATED
   const updated = await prisma.transaction.updateMany({
     where: { id: transactionId, status: 'INITIATED' },
     data: { status: 'SUCCESS' }
   });
   if (updated.count === 0) return { status: 'ignoring_duplicate' };
   ```
3. **Transaction Logs**: Log every webhook payload received strictly by its `flw_id` or `tx_ref` before processing.

---

## 3. Frontend Component Decomposition

### **Module-Based Directory Structure**
Large files like `FinancialsModule.tsx` should be moved to a "Feature" folder pattern. This scales better and makes testing easier.

#### **Proposed File Tree for Financials**
```text
src/
└── features/
    └── financials/
        ├── components/
        │   ├── SummaryGrid/
        │   │   ├── SummaryGrid.tsx
        │   │   ├── SummaryCard.tsx
        │   │   └── SummaryGrid.styles.ts
        │   ├── TransactionLedger/
        │   │   ├── TransactionTable.tsx
        │   │   └── TransactionRow.tsx
        │   └── PaymentModals/
        │       ├── RentPaymentModal.tsx
        │       └── ReceiptUploadForm.tsx
        ├── hooks/
        │   ├── useFinancialSummary.ts
        │   └── useTransactions.ts
        ├── services/
        │   └── financials.api.ts
        ├── types/
        │   └── index.ts
        └── FinancialsModule.tsx (Main Entry Point)
```

**Why?**: This allows multiple developers to work on different parts of the same "Module" without merge conflicts and improves lazy loading.

---

## 4. Frontend Service Centralization (Standard List)

Instead of one `api.ts`, split logic into domain-specific services to match the backend controllers.

### **Standard Service Registry**

| Service Name | Scope | Key Responsibilities |
| :--- | :--- | :--- |
| `AuthService` | Identity | Login, Registration, Password Resets, Kabale Claims. |
| `PaymentService` | Finance | Rent/Tax fetching, Flutterwave MoMo initiation, Evidence upload. |
| `MarketService` | Infrastructure | Market listing, Stall maps, Market-specific configurations. |
| `VendorService` | CRM | Vendor profile management, Shop setup, Stakeholder links. |
| `ProductService` | Inventory | Bulk CSV uploads, Inventory tracking, Category management. |
| `StaffService` | Operations | Gate management, Collector assignments, Attendance logs. |
| `SecurityService` | Access | RBAC verification, API Key generation, TOTP flows. |
| `ReportService` | Analytics | Revenue aggregation, Audit trail retrieval, Export to PDF/Excel. |
| `DocumentService` | Assets | Signed URL generation, File status tracking (for receipts). |

### **Implementation Pattern**
```typescript
// services/payment.service.ts
export const PaymentService = {
  getSummary: (vendorId: string) => api.get(`/vendors/${vendorId}/payments/summary`),
  initiateMomo: (data: MomoRequest) => api.post('/checkout/momo', data),
  // ...
};
```

# MarketMaster API Documentation

Comprehensive list of endpoints for the MarketMaster MMIS Platform, categorized by functional group.

## Base URL
`{{BACKEND_URL}}/api`

---

## 🔒 Authentication & Identity
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Create a new user (Vendor/Supplier/Guest). | ✅ Old |
| POST | `/auth/login` | Authenticate and get JWT. | ✅ Old |
| GET | `/auth/me` | Get currently logged-in user profile. | ✅ Old |
| POST | `/auth/verify-email` | Verify email with token. | ✅ Old |
| POST | `/auth/forgot-password` | Initiate password reset. | ✅ Old |
| POST | `/auth/reset-password` | Complete password reset. | ✅ Old |
| POST | `/auth/kabale-claim/request-email` | Request email claiming for seeded Kabale accounts. | ✨ New |
| POST | `/auth/kabale-claim/verify-email` | Verify claim token. | ✨ New |
| POST | `/auth/kabale-claim/set-password` | Set password for claimed account. | ✨ New |
| GET | `/auth/verify-vendor-email` | Specific flow for invited vendors. | ✨ New |
| GET | `/auth/audit-logs` | Retrieve user audit trail. | 🚀 Possible |

## 💰 Payments & Financials (URA/Flutterwave)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| POST | `/payments/evidence` | (Multipart) Upload bank slip/receipt evidence. | ✨ New |
| POST | `/payments/rent/record` | Admin records rent payment after verification. | ✨ New |
| GET | `/admin/payments/collections` | Revenue aggregation dashboard. | ✨ New |
| GET | `/admin/payments/outstanding` | List of vendors with overdue/pending rent. | ✨ New |
| POST | `/payments/initiate-momo` | Trigger Flutterwave MoMo checkout. | ✨ New |
| POST | `/payments/webhook` | Incoming Flutterwave webhook listener. | ✨ New |
| GET | `/payments/efris/sync-status` | Status of URA EFRIS fiscal sync. | ✨ New |
| POST | `/payments/efris/retry` | (SuperAdmin) Retry failed EFRIS syncs. | ✨ New |
| GET | `/reports/revenue-forecast` | AI-driven revenue projection API. | 🚀 Possible |

## 🏗️ Market & Infrastructure
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| GET | `/markets` | List all available markets. | ✅ Old |
| GET | `/markets/:id` | Get detailed market layout (Levels/Gates). | ✅ Old |
| GET | `/markets/search` | Search markets by name/location. | ✨ New |
| POST | `/markets/setup-shop` | Initial stall/shop assignment. | ✅ Old |
| POST | `/markets/:id/add-gate` | Register new entry/exit gate. | ✅ Old |

## 🏷️ Products & Inventory
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| GET | `/vendors/:vendorId/products` | List products for a specific vendor. | ✅ Old |
| POST | `/vendors/:vendorId/products` | Add new product. | ✅ Old |
| POST | `/vendors/:vendorId/products/bulk-upload` | (Multipart) Bulk import products via CSV. | ✨ New |
| PATCH | `/products/:productId` | Edit product details. | ✅ Old |
| DELETE | `/products/:productId` | Archive product. | ✅ Old |
| GET | `/products/stock-alerts` | Retrieve items with low inventory. | 🚀 Possible |

## 🛂 Gate & Security
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| POST | `/market/tokens/entry` | Generate entry QR token. | ✅ Old |
| GET | `/market/tokens/:code` | Scan/verify gate token. | ✅ Old |
| GET | `/market/staff/gate-counters` | List staff assigned to gates. | ✅ Old |

---

## 🛠️ Industry Standard Enhancements (Required)

1. **Webhooks Management**: `GET /webhooks` and `POST /webhooks/register` to allow external integrations.
2. **API Keys**: `POST /security/api-keys` for machine-to-machine authentication (e.g., for gate hardware).
3. **Health Check**: `GET /health` for monitoring system uptime and DB connectivity.
4. **Metrics**: `GET /metrics` (Prometheus format) for system performance monitoring.

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
