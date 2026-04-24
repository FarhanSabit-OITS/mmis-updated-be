# Implementation Plan: System-Wide Data Pre-filling & Verification

Implementing all identified data integrity and friction-reduction enhancements across the MMIS platform.

## Proposed Changes

### Phase 1: Backend API Extensions

#### [MODIFY] [shop.routes.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/routes/shop.routes.js)
- Add `GET /api/shops/verify` endpoint.

#### [MODIFY] [shop.controller.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/controllers/shop.controller.js)
- Implement `verifyShop` logic to check if a shop number exists in a market and its current vacancy status.

#### [MODIFY] [vendor.routes.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/routes/vendor.routes.js)
- Add `GET /api/vendors/check-duplicate` endpoint.

#### [MODIFY] [vendor.controller.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/controllers/vendor.controller.js)
- Implement `checkDuplicate` logic for email and phone numbers.

#### [MODIFY] [token.routes.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/routes/token.routes.js)
- Add `GET /api/tokens/vehicle-history/:plateNumber` endpoint.

#### [MODIFY] [token.controller.js](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/controllers/token.controller.js)
- Implement `getVehicleHistory` to return category and driver info for a plate number.

---

### Phase 2: Frontend API Service

#### [MODIFY] [api.ts](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/services/api.ts)
- Add methods:
  - `ApiService.shops.verify(marketId, shopNo)`
  - `ApiService.vendors.checkDuplicate(email, phone)`
  - `ApiService.tokens.getVehicleHistory(plateNumber)`

---

### Phase 3: UI Enhancement (Critical Flows)

#### [MODIFY] [VendorApplicationForm.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/VendorApplicationForm.tsx)
- Integrate real-time `shopNumber` verification on-blur.
- Add duplicate email/phone checks before submission.

#### [MODIFY] [GateTerminal.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/GateTerminal.tsx)
- Auto-fill vehicle category and driver name when `plateNumber` is entered.
- Display "Overstay Fee" alerts if the vehicle has history.

#### [MODIFY] [AdminPaymentDashboard.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/AdminPaymentDashboard.tsx)
- Auto-populate outstanding balance and target shop when a vendor is selected in the "Record Payment" modal.

---

### Phase 4: Secondary Enhancements

#### [MODIFY] [ShopModal.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/shop/ShopModal.tsx)
- Add collision detection for `stallNumber`.
- Implement auto-calculation for Annual Rent and VAT.

#### [MODIFY] [TicketSystem.tsx](file:///c:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/marketmastererp/components/TicketSystem.tsx)
- Suggest titles based on context.
- Implement auto-suggestion for staff assignment.

---

## Verification Plan

### Automated Tests
- Postman/Insomnia: Verify backend lookup endpoints return expected JSON.
- Unit Tests: Verify rent calculation logic in `ShopModal`.

### Manual Verification
1. **Vendor Onboarding**: Enter a non-existent shop ID and verify the error message.
2. **Gate Entry**: Enter a known plate number and verify pre-filled fields.
3. **Payment**: Select a vendor and verify the balance auto-populates.

# Optimizing Database Seeding Pipeline via Data Preprocessing (ETL Strategy)

Instead of relying solely on heavy runtime caching during the database seeding phase, we can introduce a robust **ETL (Extract, Transform, Load)** architecture. This involves completely separating the messy Excel extraction phase from the database insertion phase.

## 🎯 Proposed ETL Architecture

This strategy uses a multi-step pipeline to guarantee high-accuracy, conflict-free, and hyper-fast data seeding.

### Step 1: Extract & Transform (Preprocessing Script)
We will create a standalone script tool (e.g., `scripts/preprocess-registry.ts`).
1. **Extract**: It will read all `.xlsx` files from `/Data`.
2. **Clean & Validate**: It will remove completely empty rows, trim whitespace, ignore placeholder values (e.g., phone "000000000"), and drop invalid entries.
3. **Normalize & Group**: 
   - Group records by Market.
   - Extract a **distinct** list of unique `MarketSection` categories.
   - Aggregate **distinct** `Vendors` by `NIN` or generated `phone` to form one unified vendor profile even if they own multiple stalls.
   - Map `Facilities` to the distinct vendors and calculate structured `RentContracts`.
4. **Output**: It generates a clean, strictly-typed `registry-seed-data.json` file mapping perfectly to the Prisma Models.

### Step 2: Load (Database Seeding via `createMany`)
The `prisma/seeds/registry.ts` logic will be entirely revamped. 
Instead of looping over raw `.xlsx` files and blindly firing `upsert` queries:
1. It reads the clean `registry-seed-data.json`.
2. Since the data is pre-validated and deduplicated, it relies on bulk statements.
   - Ex: `prisma.marketSection.createMany({ data: jsonPayload.sections })`
   - Ex: `prisma.facility.createMany({ data: jsonPayload.facilities })`

## ✨ Advantages of Preprocessing over Caching
- **100% Accuracy Preview**: You can manually inspect `registry-seed-data.json` to verify the exact numbers of Vendors, Sections, and units *before* letting it touch the database.
- **Lightning Fast Seeding**: Using `createMany` operations will drop execution times from 2 minutes down to literally **2-3 seconds**. Caching relies on sequentially passing JS promises back and forth through Prisma; `createMany` sends one payload natively to PostgreSQL.
- **Schema Mapping**: We can enforce rigorous Type safety linking the extracted data to the newly expanded `VarChar(100)` layout effortlessly. No more runtime surprises.

## ⚠️ User Approval
> [!IMPORTANT]
> This requires constructing a new preprocessing script and shifting from row-by-row mapping. Would you like me to build out `preprocess-registry.ts` to convert the `.xlsx` files into a verified JSON structure?

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
