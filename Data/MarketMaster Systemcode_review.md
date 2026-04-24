# Code Review: MarketMaster System

This review covers the Backend (`MarketMasterApi`) and Frontend (`MarketMasterERP`) of the Uganda MMIS platform.

## 1. Backend: MarketMasterApi

### **Architecture & Design**
- **Pattern**: Uses a Controller-Service-Repository architecture which is solid for scalability. However, the `auth.controller.js` has become a "God Object" with over 2000 lines of code, violating the Single Responsibility Principle.
- **Database**: Prisma ORM is used effectively with multi-step transactions, ensuring data integrity during complex flows like registration and payment recording.
- **Organization**: Logic is well-separated into `routes`, `controllers`, `services`, and `repositories`, but the `services` layer often contains excessive boilerplate that could be moved to repositories.

### **Security & Performance**
- **Authentication**: Implementation includes JWT, email verification, and TOTP (Time-based One-Time Password) middleware. 
- **Validation**: Relies on a custom `validation.js` utility. 
- **Error Handling**: Using a centralized `ApiResponse` utility is good, but some controllers still manually construct error responses, leading to inconsistencies.

### **Key Recommendations (BE)**
- **[CRITICAL] Refactor Auth Controller**: Split `auth.controller.js` into modules (e.g., `registration.controller.js`, `identity.controller.js`, `verification.controller.js`).
- **[BEST PRACTICE] Migration to Schema Validation**: Replace custom validation utilities with **Zod** or **Joi** for declarative, type-safe schema validation at the route level.
- **[IDEMPOTENCY] Payment Webhooks**: Ensure the Flutterwave webhook is fully idempotent to prevent double-recording of payments in case of network retries.

---

## 2. Frontend: MarketMasterERP

### **UI/UX & Aesthetics**
- **Foundation**: Built with Vite + React + TypeScript. Uses Shadcn UI for the component base, which provides a clean, modern look.
- **Color Palette**: Uses `OKLCH` colors which is state-of-the-art for modern CSS, providing better color consistency across different devices.
- **Visuals**: The dashboard layout is functional but lacks the "Wow" factor requested (premium micro-interactions, glassmorphism, and dynamic data visualization).

### **Technical Quality**
- **Data Fetching**: Primarily uses `TanStack Query` which is excellent for caching and synchronization.
- **State Management**: Heavily component-based state. Large modules like `FinancialsModule` (>700 lines) should be decomposed into smaller presentational components.
- **Type Safety**: Strong TypeScript definitions in `types.ts`, which effectively mirrors the backend's Prisma schema.

### **Key Recommendations (FE)**
- **[AESTHETIC] Implement Rich Visuals**: Introduce Framer Motion for entrance animations and state transitions. Add glassmorphism effects to sidebars and modals for a "premium" feel.
- **[ARCHITECTURE] Component Decomposition**: Refactor "Module" components (e.g., `FinancialsModule`, `MyShopModule`) into a directory structure with sub-components (e.g., `financials/SummaryGrid`, `financials/TransactionLedger`).
- **[DX] API Centralization**: The `api.ts` file is monolithic. Split it into domain-specific services (e.g., `auth.service.ts`, `payment.service.ts`) corresponding to the backend structure.

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

# MarketMaster ERP: System Analysis Report
## Onboarding & Support Infrastructure

This report provides a technical audit of the current **User Onboarding** and **Support Ticket** systems, identifying architectural strengths, operational gaps, and strategic enhancement routes.

---

## 1. User Onboarding Analysis

The system utilizes a **Multi-Tiered Invitation & Handshake Architecture** to ensure high-fidelity identity verification across diverse market roles.

### A. Admin (Govt.) & Market Authority Onboarding
**Current Flow:** `Invitation` -> `OIDC/Govt. Credential` -> `Account Activation`.
- **Note:** Admin level users (National, District, City, Market Master) are **Government Employees**. Their onboarding is managed via central government provisioning and Super Admin authorization.
- **Physical Handshake (Staff Only):** For non-govt. market staff (Gate/Stock Counters), Market Authority personnel verify identities and issue a 6-digit handshake code or utilize the new **Digital Trust QR Scan**.
- **Justification:** High-security govt. roles utilize official credentials, while market-level staff require physical verification to tether their identity to the specific market facility.

### B. Vendor & Supplier Onboarding
**Current Flow:** `Self-Registration` or `Invitation` -> `Token Verification` -> `KYC Submission`.
- **Logic:** Integrated via `auth.service.js`. New vendors receive a verification token via email/SMS.
- **Compliance:** Onboarding is incomplete until `KYCStatus` reaches `VERIFIED`. 
- **Justification:** Prevents unauthorized trade and ensures all market participants are tax-compliant and legally registered under the Market Authority's jurisdiction.

### C. Operational Staff (Gate & Stock Counter)
**Current Flow:** `Market Authority Submission` -> `Super Admin Provisioning`.
- **Employment:** Staff are employed/allocated by **Market Authority Members**. 
- **Workflow:** Market Authority submits an **Employment Document** (details + NIN) to the Market Admin. The Super Admin then creates the `PseudoMarketAdmin` profile. The Market Master acknowledges the employment as part of their facility management duties.
- **Justification:** Ensures that operational staff are legally contracted by the Authority before being granted operational tokens for market checkpoints.

---

## 2. Support & Ticketing Module Analysis

The support system is built for **Enterprise-Grade Resolution** with a focus on administrative efficiency.

### A. Backend Capabilities (`support.controller.js`)
- **Ticketing:** Uses a structured `SupportTicket` model with priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **AI Integration:** Implements `aiService.summarizeTicket` to provide admins with instant snapshots of long-form complaints. 
- **Justification:** Essential for Market Masters managing thousands of vendors, where reading every detail of a long complaint is inefficient.

### B. Frontend Implementation Gap
- **Status:** The `ContactAdminForm.tsx` component is currently **EMPTY**. 
- **Observation:** While the backend is robust, legacy frontend components for user-initiated support are missing from the current `src/` directory, causing a "Dead End" in user support UX.

---

## 3. Enhancement Recommendations

### [VERIFICATION] Digital Trust Handshake (QR)
- **Recommendation:** Replace manual 6-digit handshake codes with **Dynamic QR Scanning**.
- **Workflow:** The Market Authority terminal displays a secure QR; the Staff Candidate scans it using their MMIS app. This "Handshake" performs a cryptographic link between the Authority's terminal and the Staff member's device.
- **Justification:** approved-by-user. Significantly accelerates "Physical Day 1" onboarding while maintaining non-repudiable physical proximity verification.

### [UX] Unified Onboarding Portal
- **Recommendation:** A centralized `/onboarding` route for all users that detects their invitation type and dynamically loads the required forms (KYC, Business License, Bank Details).
- **Justification:** Reduces code redundancy across role-specific pages and provides a consistent "Welcome" experience.

### [SUPPORT] Intelligent Routing & Live Operations
- **Recommendation:** Implement **Role-Based Ticket Routing**.
  - *Example:** "GATE" category tickets should automatically alert `SECURITY_ADMIN` roles on their mobile terminal.
- **Justification:** Ensures critical operational failures (e.g., gate scanner malfunction) are addressed instantly rather than waiting in a general queue.
- **Feature:** Restore the `ContactAdminForm` using the new `MMISForm` architecture, providing real-time feedback on ticket submission status.

---

## 4. Technical Debt & Critical Gaps

| Identified Gap | Severity | Recommendation |
| :--- | :--- | :--- |
| **Empty Contact Form** | **CRITICAL** | Re-implement `ContactAdminForm` using `MMISForm` and `SupportTicket` API. |
| **Manual Handshake Codes** | MEDIUM | Migrate to **Encrypted QR Code Handshakes** that can be scanned by the Onboarding App. |
| **Silent Failures** | LOW | Extend `notify` service to include **WebSocket / Push** notifications for immediate ticket updates. |

---

> [!IMPORTANT]
> **Conclusion:** The backend is exceptionally well-architected for security (RBAC/Handshake). The primary weakness lies in "The Last Mile" of the Frontend UX (Support Forms) and the manual nature of physical verification. Modernizing these will move the ERP from a "Management Tool" to a "Seamless Market Ecosystem."

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
# Master Analysis: System-Wide Data Pre-filling & Verification

This consolidated report identifies all key forms, modals, and fields within the MMIS ecosystem that are targeted for automated pre-filling and real-time verification to ensure a "Single Source of Truth" and a frictionless user experience.

---

## 1. Vendor & Business Onboarding

### [VendorApplicationForm.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/VendorApplicationForm.tsx)
- **Field**: `shopNumber` (e.g., "A-101")
  - **Verification**: Real-time lookup against the `Shop` registry to ensure the stall exists and is currently `VACANT`.
- **Field**: `phone` / `email`
  - **Verification**: Immediate duplicate check to prevent multiple registrations for the same identity.

### [AddVendorModal.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/AddVendorModal.tsx)
- **Field**: `vatNumber` / `Business Reg Code`
  - **Verification**: Real-time validation against the registry.
- **Pre-filling**: If a vendor is found in a "Legacy/Imported" state (e.g., from CSV migrations), auto-populate their historical business data (name, phone, business type) once their primary identifier is entered.

---

## 2. Market & Shop Infrastructure

### [ShopModal.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/shop/ShopModal.tsx)
- **Field**: `stallNumber`
  - **Verification**: Instant collision detection to prevent duplicate shop IDs within the same market block.
- **Pre-filling**: Auto-calculate `Annual Rent` and `VAT` as soon as the `Monthly Rent` is entered.

### [ProductForm.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/ProductForm.tsx)
- **Pre-filling**: Contextual unit suggestions (e.g., "Sacks", "Crates", "KGs") based on the selected product category to standardize inventory reporting.

---

## 3. Gate, Logistics & Supply Chain

### [GateTerminal.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/GateTerminal.tsx)
- **Field**: `plateNumber`
  - **Pre-filling**: Automated lookup of vehicle history. If the vehicle has entered before, pre-fill `vehicleCategory` (e.g., "Truck - 5 Tonnes") and `driverName`.
- **Verification**: Alert gate staff if the vehicle has outstanding "Overstay Fees" from a previous visit.

### [SupplyRequisitions.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/SupplyRequisitions.tsx)
- **Field**: `itemName`
  - **Pre-filling**: Auto-suggest based on the vendor's common stock history or high-demand items.
- **Field**: `deadline`
  - **Pre-filling**: Default to +48 hours (standard lead time).
- **Verification**: Flag supplier `bidAmount` if it deviates significantly from the "Market Reference Price."

### [SuppliersNetwork.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/SuppliersNetwork.tsx)
- **Field**: `deliveryDate`
  - **Verification**: Real-time warning if the proposed date is past the requisition's `deadline`.
- **Pre-filling**: Auto-populate supplier "Lead Time" and "Standard Terms" based on their fulfillment profile.

---

## 4. Financials & Payments

### [AdminPaymentDashboard.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/AdminPaymentDashboard.tsx)
- **Modal**: `Record Payment`
  - **Pre-filling**: Once a vendor is selected, auto-populate:
    - `Outstanding Balance`
    - `Target Shop` (from their active contract)
    - `Last Payment Period`
- **Verification**: Cross-reference manual `Transaction ID` entries for Mobile Money with the Flutterwave API logs to ensure validity before persistence.

---

## 5. Administration & Support

### [UserManagementModule.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/UserManagementModule.tsx)
- **Field**: `marketId`
  - **Pre-filling**: Automatically lock to the Admin's jurisdiction for non-SuperAdmins.
- **Field**: `email`
  - **Verification**: Enforce `@mmis.ug` domain checks for staff accounts.

### [GateStaffManagement.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/GateStaffManagement.tsx)
- **Field**: `email`
  - **Pre-filling**: Auto-generate based on `name` and `marketName` (e.g., `staff.name@market.mmis.ug`).
- **Field**: `phone`
  - **Verification**: Real-time format check against Ugandan standards.

### [AssetManagementModule.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/AssetManagementModule.tsx)
- **Field**: `assetCode` / `id`
  - **Pre-filling**: Sequence-based auto-generation based on `marketId` and `category`.
- **Field**: `location`
  - **Pre-filling**: Suggest common facility zones (Gate A, Block B) based on market maps.

### [TicketSystem.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/TicketSystem.tsx)
- **Field**: `title`
  - **Pre-filling**: Contextual suggestions based on `context` (e.g., if "ASSET," suggest "Camera Offline").
- **Verification**: Prompt to "Link Ticket to Shop/Asset Entity" if a valid identifier is detected in the description.
- **Assignment**: Auto-suggest `assignedTo` staff based on their `role` and current `shift` status.

# Unified Validation Pipeline Rollout

The MarketMaster API has been officially upgraded from custom validation utility scripts to **Declarative Zod Schema Validation**. 

> [!NOTE] 
> This completely shifts the validation burden from the service/repository layer to the very outer edges of the API (the router middleware). This prevents maliciously crafted payloads from ever reaching memory-intensive synchronous logic.

## Changes Made

### 1. Zod Declarative Schemas
Created explicitly typed security constraints inside [auth.validation.js](file:///C:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/validations/auth.validation.js) covering the complete identity workflow:
- `registerSchema` (Trims strings, mathematically asserts Email/UUID formats)
- `loginSchema`
- `resetPasswordSchema` and `changePasswordSchema` (Enforces 8-64 character length bounds instantly)

### 2. Validation Interception Middleware
Added continuous interceptor attachments on [auth.routes.js](file:///C:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/routes/auth.routes.js).

The middleware has been fortified to *auto-assign* sanitized output:
```javascript
// Trims inputs and lowercase emails, passing clean payloads back to memory
req.body = result.body;
```

### 3. Removal of Technical Debt
Completely unlinked and deleted the legacy validation engines:
- Deleted `src/utils/validation.js` entirely.
- Refactored `auth.service.js` to strip `normalizeEmail` and password formatting utilities.
- Refactored `user.service.js` and `bulk.controller.js` to rely exclusively on strict Zod definitions. 

## Validation Results
We ran a payload injection test against the `POST /api/auth/login` endpoint using maliciously formatted spacing around an invalid email string. 

The node server successfully halted execution automatically at the Zod Router interceptor layer and returned a mathematical `400 Bad Request` prior to loading Prisma ORM connections.

Additionally, a startup anomaly regarding trailing commas inside `market.repository.js` and misused asynchronous Promise Executor callbacks in `pdf.service.js` and `token.service.js` have been successfully patched, completing the code audit fixes.

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
