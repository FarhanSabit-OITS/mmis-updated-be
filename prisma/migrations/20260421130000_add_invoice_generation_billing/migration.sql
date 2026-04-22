CREATE TABLE "invoice_generation_runs" (
    "id" TEXT NOT NULL,
    "runMonth" INTEGER NOT NULL,
    "runYear" INTEGER NOT NULL,
    "scopeType" VARCHAR(30) NOT NULL,
    "scopeId" TEXT,
    "triggerType" VARCHAR(30) NOT NULL,
    "triggeredByUserId" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    "reason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "summaryJson" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_generation_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_generation_run_items" (
    "id" TEXT NOT NULL,
    "generationRunId" TEXT NOT NULL,
    "vendorId" TEXT,
    "rentContractId" TEXT,
    "invoiceId" TEXT,
    "result" VARCHAR(40) NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_generation_run_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rent_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(100),
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "rentContractId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "rentPaymentId" TEXT,
    "billingYear" INTEGER NOT NULL,
    "billingMonth" INTEGER NOT NULL,
    "invoiceVersion" INTEGER NOT NULL DEFAULT 1,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "billingStartDate" TIMESTAMP(3) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "baseRentAmount" DECIMAL(15,2) NOT NULL,
    "proratedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "arrearsAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "creditAppliedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "outstandingAmount" DECIMAL(15,2) NOT NULL,
    "creditedForwardAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    "generationMode" VARCHAR(30) NOT NULL DEFAULT 'AUTOMATIC',
    "generationRunId" TEXT,
    "replacedInvoiceId" TEXT,
    "isForcedRegeneration" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rent_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rent_invoice_lines" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "lineType" VARCHAR(40) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "quantity" DECIMAL(12,4),
    "unitAmount" DECIMAL(15,4),
    "lineAmount" DECIMAL(15,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rent_invoice_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_claims" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "claimReference" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "claimedForInvoiceId" TEXT,
    "claimedForBillingMonth" VARCHAR(7),
    "externalReference" VARCHAR(100),
    "notes" TEXT,
    "proofDocumentId" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    "submittedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_claims_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "paymentClaimId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "paymentMethod" VARCHAR(50) NOT NULL,
    "paymentChannel" VARCHAR(40) NOT NULL,
    "provider" VARCHAR(50),
    "providerReference" VARCHAR(100),
    "providerPayload" JSONB,
    "status" VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "documentId" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_credits" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "sourcePaymentId" TEXT NOT NULL,
    "amountRemaining" DECIMAL(15,2) NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "status" VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_credits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_billing_statuses" (
    "vendorId" TEXT NOT NULL,
    "billingAccessState" VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    "restrictionReason" TEXT,
    "restrictedAt" TIMESTAMP(3),
    "unrestrictedAt" TIMESTAMP(3),
    "consecutiveZeroPaymentMonths" INTEGER NOT NULL DEFAULT 0,
    "lastEvaluatedMonth" VARCHAR(7),
    "contactAdminEmail" VARCHAR(255),
    "contactAdminPhone" VARCHAR(20),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_billing_statuses_pkey" PRIMARY KEY ("vendorId")
);

CREATE UNIQUE INDEX "rent_invoices_invoiceNumber_key" ON "rent_invoices"("invoiceNumber");
CREATE UNIQUE INDEX "rent_invoices_rentContractId_billingYear_billingMonth_invoiceVersion_key" ON "rent_invoices"("rentContractId", "billingYear", "billingMonth", "invoiceVersion");
CREATE UNIQUE INDEX "payment_claims_claimReference_key" ON "payment_claims"("claimReference");
CREATE UNIQUE INDEX "payment_allocations_paymentId_invoiceId_key" ON "payment_allocations"("paymentId", "invoiceId");

CREATE INDEX "invoice_generation_runs_runYear_runMonth_idx" ON "invoice_generation_runs"("runYear", "runMonth");
CREATE INDEX "invoice_generation_runs_scopeType_scopeId_idx" ON "invoice_generation_runs"("scopeType", "scopeId");
CREATE INDEX "invoice_generation_runs_triggerType_idx" ON "invoice_generation_runs"("triggerType");
CREATE INDEX "invoice_generation_runs_status_idx" ON "invoice_generation_runs"("status");
CREATE INDEX "invoice_generation_run_items_generationRunId_idx" ON "invoice_generation_run_items"("generationRunId");
CREATE INDEX "invoice_generation_run_items_vendorId_idx" ON "invoice_generation_run_items"("vendorId");
CREATE INDEX "invoice_generation_run_items_rentContractId_idx" ON "invoice_generation_run_items"("rentContractId");
CREATE INDEX "invoice_generation_run_items_invoiceId_idx" ON "invoice_generation_run_items"("invoiceId");
CREATE INDEX "rent_invoices_vendorId_billingYear_billingMonth_idx" ON "rent_invoices"("vendorId", "billingYear", "billingMonth");
CREATE INDEX "rent_invoices_marketId_billingYear_billingMonth_idx" ON "rent_invoices"("marketId", "billingYear", "billingMonth");
CREATE INDEX "rent_invoices_status_idx" ON "rent_invoices"("status");
CREATE INDEX "rent_invoices_dueDate_idx" ON "rent_invoices"("dueDate");
CREATE INDEX "rent_invoice_lines_invoiceId_idx" ON "rent_invoice_lines"("invoiceId");
CREATE INDEX "rent_invoice_lines_lineType_idx" ON "rent_invoice_lines"("lineType");
CREATE INDEX "payment_claims_vendorId_idx" ON "payment_claims"("vendorId");
CREATE INDEX "payment_claims_marketId_idx" ON "payment_claims"("marketId");
CREATE INDEX "payment_claims_status_idx" ON "payment_claims"("status");
CREATE INDEX "payment_claims_claimedForInvoiceId_idx" ON "payment_claims"("claimedForInvoiceId");
CREATE INDEX "invoice_payments_vendorId_idx" ON "invoice_payments"("vendorId");
CREATE INDEX "invoice_payments_marketId_idx" ON "invoice_payments"("marketId");
CREATE INDEX "invoice_payments_paymentClaimId_idx" ON "invoice_payments"("paymentClaimId");
CREATE INDEX "invoice_payments_status_idx" ON "invoice_payments"("status");
CREATE INDEX "payment_allocations_paymentId_idx" ON "payment_allocations"("paymentId");
CREATE INDEX "payment_allocations_invoiceId_idx" ON "payment_allocations"("invoiceId");
CREATE INDEX "vendor_credits_vendorId_idx" ON "vendor_credits"("vendorId");
CREATE INDEX "vendor_credits_marketId_idx" ON "vendor_credits"("marketId");
CREATE INDEX "vendor_credits_status_idx" ON "vendor_credits"("status");
CREATE INDEX "vendor_billing_statuses_billingAccessState_idx" ON "vendor_billing_statuses"("billingAccessState");

ALTER TABLE "invoice_generation_runs" ADD CONSTRAINT "invoice_generation_runs_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoice_generation_run_items" ADD CONSTRAINT "invoice_generation_run_items_generationRunId_fkey" FOREIGN KEY ("generationRunId") REFERENCES "invoice_generation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_rentContractId_fkey" FOREIGN KEY ("rentContractId") REFERENCES "rent_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_rentPaymentId_fkey" FOREIGN KEY ("rentPaymentId") REFERENCES "rent_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_generationRunId_fkey" FOREIGN KEY ("generationRunId") REFERENCES "invoice_generation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_replacedInvoiceId_fkey" FOREIGN KEY ("replacedInvoiceId") REFERENCES "rent_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rent_invoice_lines" ADD CONSTRAINT "rent_invoice_lines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "rent_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_claims" ADD CONSTRAINT "payment_claims_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_claims" ADD CONSTRAINT "payment_claims_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_claims" ADD CONSTRAINT "payment_claims_claimedForInvoiceId_fkey" FOREIGN KEY ("claimedForInvoiceId") REFERENCES "rent_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_claims" ADD CONSTRAINT "payment_claims_proofDocumentId_fkey" FOREIGN KEY ("proofDocumentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "invoice_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "rent_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_credits" ADD CONSTRAINT "vendor_credits_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_credits" ADD CONSTRAINT "vendor_credits_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_credits" ADD CONSTRAINT "vendor_credits_sourcePaymentId_fkey" FOREIGN KEY ("sourcePaymentId") REFERENCES "invoice_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendor_billing_statuses" ADD CONSTRAINT "vendor_billing_statuses_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
