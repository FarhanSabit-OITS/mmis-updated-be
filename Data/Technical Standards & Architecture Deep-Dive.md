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
