# MarketMaster ERP — Full Codebase Review & Analysis Report
> Reviewed & Resolved Tracker: 2026-04-11 | Scope: MarketMasterApi Backend (Node.js/Express/Prisma)

---

## Executive Summary

The backend is **architecturally sound** — clean layered structure (Routes → Controller → Service → Repository), standardised Prisma ORM usage, JWT + RBAC security, and a working seeding pipeline. However the review surfaced **12 actionable bugs**, **6 seed file issues**, **4 security gaps**, and a significant set of optimisation opportunities. This document tracks the resolution status of all identified items, including newly discovered issues from the Phase 2 review.

---

## 1. Critical Bugs & Issues

### 🔴 Bug 1 — `sendPaymentReminder` is a Stub (payment.controller.js:151)
**File:** `src/controllers/payment.controller.js`  
**Problem:** The handler always returns a hardcoded stub response — no email is actually sent.
> **Status:** 🟢 **Resolved** (Integrated with `email.service.js` to dispatch full email notifications).

---

### 🔴 Bug 2 — `vendorOnboarding` endpoint is a No-Op Stub (auth.controller.js:279)
**File:** `src/controllers/auth.controller.js`  
**Problem:** The vendor first-login onboarding endpoint always returns 200 OK without performing any logic whatsoever.
> **Status:** 🟢 **Resolved** (Delegated route exactly to `vendorOnboardingController.setupShop`).

---

### 🔴 Bug 3 — `createTicket` uses `creatorId` from request body (support.controller.js:34)
**File:** `src/controllers/support.controller.js`  
**Problem:** The `creatorId` is taken directly from `req.body`, not from the authenticated `req.user`. A malicious user can create tickets attributed to any user ID.
> **Status:** 🟢 **Resolved** (code updated to use `req.user.userId`, but see Newly Found Issue 2).

---

### 🔴 Bug 4 — `compliance.controller.js` creates its own `PrismaClient` instance (line 3)
**File:** `src/controllers/compliance.controller.js`  
**Problem:** `new PrismaClient()` is instantiated directly inside the controller file. This creates a second, unmanaged connection pool. Every request needlessly opens a new connection.
> **Status:** 🟢 **Resolved** (Imports `../shared/prisma` instead).

---

### 🔴 Bug 5 — `deleteStaff` hard-deletes the User record (staff.controller.js:188)
**File:** `src/controllers/staff.controller.js`   
**Problem:** Deleting a staff member cascades to permanently delete the user. This violates data retention requirements and will break audit log foreign keys.
> **Status:** 🟢 **Resolved** (Code replaced with `status: 'INACTIVE'` soft-delete).

---

### 🟠 Bug 6 — `authLimiter` is defined but NEVER applied to `/login` on the app level
**File:** `src/routes/auth.routes.js` / `src/middleware/rateLimit.middleware.js`  
**Problem:** `authLimiter` is exported and applied to `/login`, `/register`, etc. in `auth.routes.js`. However, the global `apiLimiter` (100 req/15min) applied in `src/index.js` takes precedence at app-level and there is no proxy trust configured. On a reverse-proxied server, `req.ip` will always be the internal proxy IP, making the limiter effectively useless for all clients.
> **Status:** 🟢 **Resolved** (`app.set('trust proxy', 1)` added to `index.js`).

---

### 🟠 Bug 7 — `inventory.service.js` — null safety on `_sum.quantity` (line 30)
**File:** `src/services/inventory.service.js`  
**Problem:** `item._sum.quantity` can be `null` when no records exist for that group in Prisma's `groupBy` + `_sum`. Accessing it will throw `TypeError: Cannot read properties of null`.
> **Status:** 🟢 **Resolved** (Null coalescing operator `?? 0` added).

---

### 🟠 Bug 8 — `geo.ts` seed cityMap key uses district name, markets.ts uses city name
**File:** `prisma/seeds/geo.ts` line 88 vs `prisma/seeds/markets.ts` line 10
**Problem:** `geo.ts` builds the `cityMap` with keys derived from district names. But `markets.ts` looks up by city name Key `"Mbarara"`, leaving **Mbarara Market with no Market Master**.
> **Status:** 🟢 **Resolved** (Mbarara Market Master added to `admin.ts`).

---

### 🟠 Bug 9 — `registry.ts` silently swallows all row-level errors (line 213)
**File:** `prisma/seeds/registry.ts`  
**Problem:** The entire catch block is empty. If a row fails (e.g., unique constraint, malformed data), the error is swallowed silently. This makes debugging seeding failures nearly impossible.
> **Status:** 🟢 **Resolved** (`console.warn` log added to track skipping).

---

### 🟡 Bug 10 — `payment.controller.js` — `getRevenueHub` has NO auth middleware on its route
**File:** `src/routes/payment.routes.js`
**Problem:** The handler is mounted publicly at `GET /api/revenue-hub` unless the `router.use(authMiddleware)` catches it.
> **Status:** 🟢 **Resolved** (Endpoint has `isAdmin` checks embedded inside and the router strictly uses the auth guard).

---

### 🟡 Bug 11 — `updateStaff` has no RBAC check (staff.controller.js:150)
**File:** `src/controllers/staff.controller.js`  
**Problem:** Any authenticated user who knows a staff `id` can update any staff member's role or section without any role check.
> **Status:** 🟢 **Resolved** (SuperAdmin and MarketMaster role gateway added).

---

### 🟡 Bug 12 — `compliance.routes.js` has NO auth middleware
**File:** `src/routes/compliance.routes.js`
**Problem:** Both the `/audit` and `/dashboard` endpoints are completely unprotected — no `authMiddleware` is imported or applied.
> **Status:** 🟢 **Resolved** (`router.use(authMiddleware)` added).

---

## 2. Seed File Issues
> All specific sub-issues identified in the original review appear to be **Pending Review/Pending Completion** except for the Mbarara master seed mapping which was verified. The overall structural overhaul of `cleanup.ts` and `registry.ts` batching (Perf-5) awaits execution.

---

## 3. Security Gaps

| # | Location | Issue | Severity | Status |
|---|---|---|---|---|
| S1 | `.env` line 22 | `JWT_SECRET=your-super-secret-jwt-key` — default placeholder key is committed | 🔴 Critical | 🟡 Pending |
| S2 | `.env` line 30–32 | SMTP credentials are placeholders — email features silently fail | 🟠 High | 🟡 Pending |
| S3 | `compliance.routes.js` | Both endpoints unprotected (no auth) | 🔴 Critical | 🟢 Resolved |
| S4 | `support.controller.js` | `creatorId` taken from body, not from `req.user` | 🔴 Critical | 🟢 Resolved |
| S5 | `index.js` | `trust proxy` not set — rate limiter is ineffective behind reverse proxy | 🟠 High | 🟢 Resolved |
| S6 | `.env` | `GEMINI_API_KEY` / `AI_API_KEY` is not in `.env` or `.env.example` | 🟠 High | 🟡 Plan Created |

---

## 4. Architecture & Code Quality Observations

### A1 — Two different `prisma` import paths coexist
> **Status:** 🟢 **Resolved** (`src/shared/prisma.js` re-exports the canonical `src/prisma.js` singleton).

### A2 — Direct `prisma` call inside `payment.controller.js` (getRevenueHub)
> **Status:** 🟢 **Resolved** (Refactored logic into `payment.service.js` and added pagination limits).

### A3 — Inconsistent `utils` import pattern
> **Status:** 🟢 **Resolved** (`catchAsync` added to barrel export in `utils/index.js` and updated across controllers).

### A4 — No input validation on critical mutation endpoints
> **Status:** 🟢 **Resolved** (Zod validation middleware built. Schemas applied to `inventory`, `staff`, and `support` mutation endpoints).

### A5 — No `AuditLog` writes from financial & operational controllers
> **Status:** 🟢 **Resolved** (`logAudit` routine added to `compliance.service.js` and plugged into `inventory.controller.js` and `payment.controller.js`).

---

## 5. Optimisation Suggestions
**Perf-1 Database Indexes:** 🟡 Pending Execution
**Perf-2 Paginate `getRevenueHub`:** 🟢 Resolved
**Perf-3 Replace deep `include` chains:** 🟢 Resolved (select projections implemented in getRevenueHubPaginated).
**Perf-4 WebSocket room-based scoping:** 🟡 Pending
**Perf-5 Seed Performance Batching:** 🟢 Resolved (Re-architected `registry.ts` nested loop to use parallel `chunkSize = 50` via `Promise.all`).

---

## 6. Missing `.env` Variables
> **Status:** 🟢 **Resolved** (`GEMINI_API_KEY`, `UPLOADS_DIR`, and `SEED_DATA_DIR` added to `.env.example`).

---

## Phase 2: Newly Discovered Issues (Critcal Architecture & Security Review)

During a secondary review of the whole `src` layer, the following urgent issues were uncovered:

### 🔴 Newly Found Bug 1 — Widespread Prisma Connection Pool Exhaustion Epidemic
**Where:** 
- `src/services/product.service.js` (line 9)
- `src/services/notification.service.js` (line 5)
- `src/services/compliance.service.js` (line 4)
- `src/controllers/bulk.controller.js` (line 8)
- `src/controllers/dashboard.controller.js` (line 4)
- `src/controllers/document.controller.js` (line 8)
- `src/controllers/product.controller.js` (line 12)
- `src/controllers/vendor.onboarding.controller.js` (line 3)
- `src/controllers/notification.controller.js` (line 2)
- `src/controllers/admin.onboarding.controller.js` (line 2)

**Explanation & Effects:** 
The original review caught this in `compliance.controller.js`, but a deeper search reveals that `const prisma = new PrismaClient();` is instantiated in at least **10 additional files**. 
In a Node.js environment, every new `PrismaClient` spins up its own separate connection pool to the database. When concurrent users hit these endpoints, hundreds of connection pools will be created simultaneously, rapidly exceeding PostgreSQL's maximum connection limit (`max_connections`, usually ~100). The server will crash under minimal load with `Connection pool exhausted` or `Too many clients already`.
**Consequence level:** 🔴 Application crash under load, unmanageable database scaling.
**Fix Proposal:** Find all instances of `const prisma = new PrismaClient();` across `src/controllers` and `src/services` and replace them with `const prisma = require('../shared/prisma');` (adjusting the relative path `../` or `../../` as appropriate based on the directory depth). Remove `const { PrismaClient } = require('@prisma/client');` imports where they become unused.
> **Status:** 🟢 **Resolved** (Cleaned up across all 10+ identified files).

### 🔴 Newly Found Bug 2 — Completely Unprotected Support Module (`support.routes.js`)
**Where:** `src/routes/support.routes.js`
**Explanation & Effects:** 
Unlike almost every other route file which uses `router.use(authMiddleware)` or assigns it per route, the support router does not import or use `authMiddleware` anywhere. 
This means endpoints like `POST /api/support` and `POST /api/support/:id/summarize` are publicly callable from the internet.
- **Malicious Attack Vector:** A public attacker can flood the database with spam support tickets.
- **Fatal Crash Risk:** Because Bug 3 ("creatorId uses req.body") was recently fixed to use `req.user.userId`, and the route is entirely unauthenticated, `req.user` will be `undefined`. Any caller hitting this endpoint will instantly crash the Node process with `TypeError: Cannot read properties of undefined (reading 'userId')`.
- **Financial/API Limit Waste:** The AI summarize endpoint is similarly unauthenticated, meaning an attacker could script a loop to hit the endpoint repeatedly, burning through Gemini API quotas entirely unchecked.
**Consequence level:** 🔴 Spontaneous sever crashes, API billing abuse, data pollution.
**Fix Proposal:** Import the `authMiddleware` in `src/routes/support.routes.js` and apply it to the ticket creation, summary, and update endpoints to ensure only authenticated users can access them.
> **Status:** 🟢 **Resolved** (Added `router.use(authMiddleware)` lock).
