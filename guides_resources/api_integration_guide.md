# MMIS Platform: Comprehensive API Integration Guide

This guide is for frontend developers integrating the MarketMaster ERP with the Backend API.

## 0. Environment Setup & Launch

To get the backend running locally, follow these steps:

1.  **Clone & Install**: `npm install`
2.  **Environment Variables**: Create a `.env` file in the root directory. You can use the following template for a local Docker/PostgreSQL setup:

```env
# Database Configuration (Local Docker Default)
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=fts
DB_NAME=mmis_db

# Prisma Connection String
DATABASE_URL="postgresql://postgres:fts@localhost:5434/mmis_db?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000 

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration (Must match your React/Vite port)
FRONTEND_URL=http://localhost:5173
```

3.  **Automated Launch**: Run the following script to sync the DB, generate Prisma clients, seed data, and start the server:
    - **Windows**: `.\guides_resources\setup_and_run.ps1`
    - **Linux/Mac**: `bash guides_resources/setup_and_run.sh`

---


## 1. Authentication Flow
- **Token Storage**: Store the `accessToken` in `localStorage` as `mmis_token`.
- **Interceptors**: Use the interceptors in `services/api.ts` to automatically attach the `Bearer` token.
- **Onboarding Trigger**: After login, if `response.data.data.needsOnboarding` is `true`, redirect the user to the `/onboarding` wizard.

## 2. Global Response Conventions

### The "Double .data" Caveat
The backend wraps all successful responses in an `ApiResponse` object. Combined with Axios's own `data` wrapper, the actual payload is often at:
```typescript
const payload = response.data.data;
```
Always check the `ApiService` implementation in `api.ts` for how it handles this.

### Error Handling
Errors follow this structure:
```json
{
  "success": false,
  "message": "Human readable error",
  "errors": [] // Optional validation details
}
```

## 3. Onboarding Endpoints (Hardened)

### Vendor Shop Setup
**Endpoint**: `POST /api/vendors/setup-shop`
**Format**: `multipart/form-data`
**Key Fields**:
- `marketId`: UUID (internal) - Fetch and show `market.name` in UI.
- `shopName`: String
- `taxIdNumber`: String (10-digit TIN)
- `tinDocument`: File (PDF/Image)
- `levelId`: (Optional) UUID - Fetch and show `level.name` in UI.

### Supplier Profile Setup
**Endpoint**: `POST /api/suppliers/setup-profile`
**Format**: `multipart/form-data`
**Key Fields**:
- `businessName`: String
- `businessType`: String
- `taxIdNumber`: String
- `tinDocument`: File

## 4. Prefill & Discovery
Use the `ApiService.markets` namespace to prefill dropdowns:
- `ApiService.markets.list()`: Gets all available markets.
- `ApiService.markets.getDetails(id)`: Gets levels, sections, and average rent for a specific market.

## 5. Common Pitfalls
- **Multipart Headers**: When using `FormData`, Axios handles the boundary automatically. Do NOT manually set `Content-Type` to `multipart/form-data` without the boundary (the `ApiService` methods handle this correctly).
- **Public Routes**: Endpoints like `/api/markets` are public and do not strictly require a token, but will return more relevant data if one is provided.
- **Validation Errors**: If you get a `400 Validation error`, check the `errors` array in the response for field-specific Zod issues.

## 6. CRUDS & Prefill Registry

| Resource | Base Endpoint | Prefill Dependency |
| :--- | :--- | :--- |
| **Cities** | `/api/cities` | None (Initial Seeding) |
| **Markets** | `/api/markets` | `cityId` |
| **Levels** | `/api/markets/:id/levels` | `marketId` |
| **Sections** | `/api/markets/:id/sections` | `levelId`, `marketId` |
| **Shops** | `/api/shops` | `marketId`, `sectionId` |
| **Vendors** | `/api/vendors` | `marketId` (Primary Market) |
| **Suppliers** | `/api/suppliers` | None (Regional/Global) |
| **Products** | `/api/products` | `vendorId`, `categoryId` |
| **Staff** | `/api/market/staff` | `marketId`, `sectionId` |

## 7. Financial Terms & Rent Control
- **Automatic Enforcement**: During vendor onboarding (`setup-shop`), the `monthlyRent` field is **Locked**.
- **Fallback Logic**: 
  1. If the vendor already has an assigned stall (Seeded Vendors), that specific `monthlyRate` is used.
  2. If absent, the system fetches the `averageRent` from the selected market registry.
  3. If neither exists, it defaults to 0.
- **Form Logic**: Frontend should display the rent as a "Read Only" prefilled field. Display the currency (UGX) clearly.
- **Admin Overrides**: Custom rent adjustments can only be performed by admins via the `RentContract` module.

## 8. Market Staff Management
All counter staff onboarding requires the following metadata:
- `shift`: `DAY` | `NIGHT` | `EVENING`.
- `staffStatus`: `ACTIVE` | `INACTIVE` | `PRESENT` | `ON_LEAVE`.

### Gate Counters
- **Endpoint**: `POST /api/market/staff/gate-counters`
- **Payload**: `{ firstName, lastName, email, phone, password, shift, staffStatus }`
- **Role**: Handles gate entry/exit tokens.

### Stock Counters
- **Endpoint**: `POST /api/market/staff/stock-counters`
- **Payload**: `{ firstName, lastName, email, phone, password, shift, staffStatus, sectionId? }`
- **Role**: Handles inventory and delivery verification.

## 9. Required Frontend Changes (MarketMasterERP)

### API Service Update (`services/api.ts`)
Update the `market` and `vendors` namespaces to handle the new staff parameters:

```typescript
// Update Staff Interfaces
export interface StaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  shift: 'DAY' | 'NIGHT' | 'EVENING';
  staffStatus: 'ACTIVE' | 'INACTIVE' | 'PRESENT' | 'ON_LEAVE';
  sectionId?: string; // For stock counters
}

// Add to ApiService
staff: {
  createGateCounter: (data: StaffPayload) => api.post('/market/staff/gate-counters', data),
  createStockCounter: (data: StaffPayload) => api.post('/market/staff/stock-counters', data),
  listStockCounters: () => api.get('/market/staff/stock-counters'),
}
```

### UI Component Updates
1. **Onboarding Form**: 
   - Use labels like "Select Market" and show names, but submit `marketId` behind the scenes.
   - Disable the Rent input field (Set `readOnly` or `disabled`).
2. **Staff Management**: 
   - Update the "Add Staff" modal to include a dropdown for `Shift` and `Status`.
   - Add a "Counter Type" toggle or separate tabs for Gate vs. Stock counters.
3. **UUID Visibility**: Ensure no UUIDs are visible to users. Map all ID fields to their respective `name` or `displayName` properties fetched from prefill endpoints.
