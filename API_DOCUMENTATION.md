# MarketMasterApi Documentation

This document provides a comprehensive overview of all API endpoints available in the MarketMasterApi, specifically aligned with the MarketMasterERP frontend integration requirements.

## Base URL
`{{baseURL}}/api`

## Authentication
Most endpoints require a JWT Bearer Token in the `Authorization` header.
`Authorization: Bearer {{bearer_token}}`

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate (returns `needsOnboarding` flag) |
| POST | `/auth/register` | Register new user |
| GET | `/auth/me` | Get current user profile |
| GET | `/auth/markets` | List markets for selection |

**Login Response Snippet**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "role": "Vendor",
      "needsOnboarding": true,
      "kycStatus": "PENDING"
    }
  }
}
```

---

## 2. KYC Management (`/kyc`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/kyc/submit` | Submit KYC (nationalId, residentialAddress, etc.) |
| GET | `/kyc/status` | Get current status (PENDING, VERIFIED, REJECTED) |
| POST | `/kyc/review` | Admin review (VERIFIED/REJECTED) |

**Submit Body Example**:
```json
{
  "nationalId": "CM1234567890",
  "nationalIdType": "NIN",
  "residentialAddress": "123 Market St, Kampala",
  "businessType": "RETAIL"
}
```

---

## 3. Gate & Tokens

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/gate/entry` | Generate entry token. Returns `tokenCode`, `shortCode`, and `qrPayload`. |
| POST | `/gate/scan-exit` | Preview exit fees. Supports lookup by `tokenCode` or `shortCode`. |
| POST | `/gate/exit` | Finalize exit and mark token as used. |
| GET | `/gate/logs` | List recent gate activity |

---

## 4. Financials (`/financials`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/financials/pay` | Process general payment (dues, taxes) |

---

## 5. Vendor & Shop Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/vendors/setup-shop` | Setup Shop/Stall (Requires TIN + Document) |
| POST | `/suppliers/setup-profile` | Setup Supplier (Requires TIN + Document) |
| GET | `/vendors/:vendorId/payments/summary` | Financial health overview |
| GET | `/vendors/:vendorId/invoices` | List billing history |

**Onboarding (Multipart Form Data)**:
Required/Optional fields for `/setup-shop` and `/setup-profile`:
- `taxIdNumber`: string (Required)
- `tinDocument`: File (Required)
- `bankName`: string (Optional)
- `bankAccountNumber`: string (Optional)
- `bankAccountName`: string (Optional)
- `mobileMoneyNumber`: string (Optional - e.g. "25677...")
- `mobileMoneyNetwork`: string (Optional - "MTN" or "AIRTEL")

**Side Effects**:
1. Creates a `RentContract` (12 months).
2. Generates an initial `RentInvoice` (Pro-rated/Pending).
3. Sends a `HIGH` priority notification to Market Masters for TIN verification.

---

## 6. Products (`/products` & `/vendors/:id/products`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/vendors/:vendorId/products` | Create product |
| GET | `/vendors/:vendorId/products` | List vendor products |
| GET | `/products/:productId` | Get product details |
| PATCH | `/products/:productId` | Update product |

---

## 7. Staff & Market Operations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/market/staff/gate-counters` | List staff assigned to gates |
| POST | `/market/tokens/entry` | Issue handheld entry token |

---

## 8. Facility Structure

| Method | Endpoint | Description |
|---|---|---|
| GET | `/markets` | List all markets |
| GET | `/cities` | List cities |
| GET | `/shops` | List shops |
| GET | `/stalls` | List stalls |
