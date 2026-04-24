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
