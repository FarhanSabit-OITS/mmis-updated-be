# MarketMaster System Enhancement & Documentation Plan

This document outlines the proposed strategy to execute your requested tasks:
1. **Code Review**: Auditing both Backend (MarketMasterApi) and Frontend (MarketMasterERP) against industry standards.
2. **API Documentation**: Generating a comprehensive Swagger/OpenAPI-style document for the entire system.
3. **Frontend Implementation Plan**: Upgrading the Frontend to support the newly built Flutterwave Mobile Money, URA EFRIS, and TOTP features.

---

## 1. Frontend Enhancement Implementation Plan (MarketMasterERP)

Based on the recent production-grade upgrades to the backend, the Frontend requires significant enhancements to fully utilize these new features.

### A. Vendor Payment Dashboard (`VendorPaymentDashboard.tsx`)
- **Mobile Money Checkout UI**: Add a checkout flow that prompts the vendor for their MTN/Airtel mobile number and network, calling the new `/api/checkout/momo` endpoint to trigger a USSD push.
- **EFRIS Fiscal Receipts**: Update the payment history table to visually indicate if a payment has been synced with URA. Include a modal to display the `efrisReceiptId` and render a QR code using the `efrisVerificationCode` for tax compliance visibility.

### B. Admin Payment & Revenue Dashboard (`AdminPaymentDashboard.tsx`)
- **EFRIS Sync Monitor**: Implement a new sub-tab displaying the background queue status (`/api/admin/payments/efris/status`).
- **Sync Retry Capabilities**: Add a bulk action button to retry failed or pending EFRIS sync jobs (`/api/admin/payments/efris/retry-all`).
- **TOTP-Protected Actions**: For highly sensitive endpoints like `/api/payments/rent/record` (manual cash recording) and `/api/payments/refund`, introduce a strict 2FA challenge modal. The admin must input their authenticator code before the UI submits the request with the `x-totp-code` header.

### C. Security Settings (`ProfileSettings.tsx`)
- **TOTP Enrollment**: Add a new "Security" section for users with elevated permissions (Admin, MarketMaster). This will display a generated QR code from the backend allowing them to enroll their device in TOTP MFA.

### D. Component Library Updates
- Introduce a generic `TOTPChallengeModal` component that can wrap any high-risk action.
- Introduce an `EFRISReceiptRenderer` component for generating compliant receipts.

---

## 2. Code Review Strategy (BE & FE)

I will generate a separate artifact: `code_review_report.md`. This will evaluate both codebases against Tier-1 FinTech and ERP standards.

**Backend Focus Areas:**
- **Security**: JWT implementation, CORS, TOTP non-repudiation, and webhook timing-safe validation.
- **Architecture**: Multi-tenancy isolation (`resolveVendorScope`), queue resilience (BullMQ exponential backoff), and Prisma schema integrity.
- **Performance**: Axios timeouts, database indexing, and async operations.

**Frontend Focus Areas:**
- **State Management**: React Query caching strategies, optimistic updates.
- **Component Architecture**: Reusability of Shadcn/Tailwind components, avoidance of prop drilling.
- **Security**: Secure storage of JWT tokens (Local/Session storage vulnerabilities vs HTTP-only cookies consideration).

---

## 3. Complete API Documentation Strategy

I will generate a separate artifact: `api_documentation.md`. This will be structured as a comprehensive Markdown API Reference (akin to Stripe or Flutterwave documentation).

**Sections to Include:**
1. **Authentication & Authorization**: Login, Registration, JWT format, and TOTP headers.
2. **Payment & EFRIS S2S (New)**: Mobile Money checkout, Webhooks, S2S Sync monitors.
3. **Core Registry (Old & Maintained)**: Vendors, Products, Shops, and Market configurations.
4. **Access Control**: Clearly denoting which roles (SuperAdmin, Vendor, etc.) can access each endpoint.

---

## User Review Required

> [!IMPORTANT]
> Please review this roadmap. 
> 1. Do you approve the **Frontend Enhancement Plan** for integrating MoMo, EFRIS, and TOTP?
> 2. Once approved, I will immediately generate the `code_review_report.md` and `api_documentation.md` artifacts, and we can begin modifying the React codebase.

Would you like me to proceed with generating the API Documentation and Code Review artifacts based on this structure?
