# Implementation Plan: Asynchronous Bulk Upload Streaming

Refactor the `bulk.controller.js` to utilize Node.js streams for CSV processing, mitigating DoS risks and reducing memory footprint during large-scale jurisdictional data ingestion.

## Proposed Changes

### 1. Bulk Controller Optimization
Shift from `csv-parse/sync` to the asynchronous streaming API of `csv-parse`.

#### [MODIFY] [bulk.controller.js](file:///C:/Users/NEPTUNE%20TECH/OneDrive/Desktop/UGANDA%20MMIS%20REPOS/MarketMasterApi/src/controllers/bulk.controller.js)
- Replace `const { parse } = require('csv-parse/sync');` with `const { parse } = require('csv-parse');`.
- Implement a `streamAndProcess` helper function that reads from `req.files.file.tempFilePath` using `fs.createReadStream`.
- Iterate through rows using an `async iterator` or stream event handlers to process DB writes without blocking the event loop.
- Maintain a running tally of success/failure counts to return a final summary response.

### 2. File Handling
Ensure that the `express-fileupload` temporary files are correctly utilized as the stream source.

- **Check**: `index.js` already has `useTempFiles: true` enabled.
- **Action**: Use `fs.createReadStream(file.tempFilePath)` to minimize memory usage for multi-MB uploads.

## Verification Plan

### Automated Tests
- Create a large sample CSV (e.g., 5,000 users).
- Submit to `/api/bulk/users` and monitor CPU/Memory usage via a node-process-stats script.
- Verify that the process remains responsive to concurrent requests (pinging `/api/health` during upload).

### Manual Verification
- Upload a standard vendor XLSX/CSV file via the ERP interface and confirm the success/failure logs in the UI results match the backend summary.
