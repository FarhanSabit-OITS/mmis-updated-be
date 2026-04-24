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
