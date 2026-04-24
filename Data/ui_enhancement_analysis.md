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
