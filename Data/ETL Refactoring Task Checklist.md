# ETL Refactoring Task Checklist

- [x] **Create ETL Pre-processor**
  - [x] Initialize `scripts/preprocess-registry.ts`.
  - [x] Implement robust XLSX parsing (skipping bad rows, formatting names/numbers).
  - [x] Group extracted elements into unified entities: `users`, `vendors`, `sections`, `facilities`, and `contracts`.
  - [x] Export `registry-seed-data.json`.
- [x] **Run Preprocessor and Verify**
  - [x] Execute `npx ts-node scripts/preprocess-registry.ts` inside API.
  - [x] Check output mapping of `registry-seed-data.json`.
- [x] **Refactor `registry.ts` (Loader)**
  - [x] Strip out XLSX processing.
  - [x] Modify it to import `registry-seed-data.json` instead.
  - [x] Replace `for/upsert` loops with sequential batch creations (using parallel `Promise.all` batches utilizing global reference Maps).
- [x] **Data Pipeline Verification**
  - [x] Execute `npx prisma db push --accept-data-loss` / `npx ts-node prisma/seed.ts`.
  - [x] Benchmark execution time: Dropped from **109.29s** to **14.66s** !!
- [x] **Finalize Details**
  - [x] Verify MMIS ID, Contract generation structure works identically in the pre-processor.
