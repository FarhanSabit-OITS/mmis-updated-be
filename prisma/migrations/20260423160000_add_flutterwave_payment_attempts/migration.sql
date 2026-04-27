-- AlterTable
ALTER TABLE "invoice_payments" ADD COLUMN     "paymentAttemptId" TEXT;

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" TEXT NOT NULL,
    "attemptReference" VARCHAR(100) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "selectionMode" VARCHAR(40) NOT NULL,
    "requestedAmount" DECIMAL(15,2) NOT NULL,
    "confirmedAmount" DECIMAL(15,2),
    "status" VARCHAR(40) NOT NULL DEFAULT 'INITIATED',
    "provider" VARCHAR(50) NOT NULL DEFAULT 'FLUTTERWAVE',
    "providerTxRef" VARCHAR(120),
    "providerTransactionId" VARCHAR(120),
    "checkoutUrl" VARCHAR(500),
    "providerPayload" JSONB,
    "invoiceSelectionSnapshot" JSONB,
    "allocationPreviewSnapshot" JSONB,
    "failureReason" TEXT,
    "mismatchReason" TEXT,
    "redirectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "supersededByAttemptId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempt_invoices" (
    "id" TEXT NOT NULL,
    "paymentAttemptId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "invoiceNumberSnapshot" VARCHAR(100),
    "invoiceOutstandingSnapshot" DECIMAL(15,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempt_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'FLUTTERWAVE',
    "eventReference" VARCHAR(150),
    "eventType" VARCHAR(80) NOT NULL,
    "paymentAttemptId" TEXT,
    "invoicePaymentId" TEXT,
    "vendorId" TEXT,
    "marketId" TEXT,
    "providerTransactionId" VARCHAR(120),
    "providerTxRef" VARCHAR(120),
    "status" VARCHAR(40) NOT NULL DEFAULT 'RECEIVED',
    "signatureValid" BOOLEAN,
    "payload" JSONB,
    "headers" JSONB,
    "processingNotes" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_records" (
    "id" TEXT NOT NULL,
    "invoicePaymentId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currencyCode" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "status" VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "internalReference" VARCHAR(100),
    "requestedByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,
    "processedByUserId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_attemptReference_key" ON "payment_attempts"("attemptReference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_providerTxRef_key" ON "payment_attempts"("providerTxRef");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempts_providerTransactionId_key" ON "payment_attempts"("providerTransactionId");

-- CreateIndex
CREATE INDEX "payment_attempts_vendorId_idx" ON "payment_attempts"("vendorId");

-- CreateIndex
CREATE INDEX "payment_attempts_marketId_idx" ON "payment_attempts"("marketId");

-- CreateIndex
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts"("status");

-- CreateIndex
CREATE INDEX "payment_attempts_createdAt_idx" ON "payment_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "payment_attempt_invoices_paymentAttemptId_idx" ON "payment_attempt_invoices"("paymentAttemptId");

-- CreateIndex
CREATE INDEX "payment_attempt_invoices_invoiceId_idx" ON "payment_attempt_invoices"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_invoices_paymentAttemptId_invoiceId_key" ON "payment_attempt_invoices"("paymentAttemptId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_eventReference_key" ON "payment_webhook_events"("eventReference");

-- CreateIndex
CREATE INDEX "payment_webhook_events_paymentAttemptId_idx" ON "payment_webhook_events"("paymentAttemptId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_invoicePaymentId_idx" ON "payment_webhook_events"("invoicePaymentId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_vendorId_idx" ON "payment_webhook_events"("vendorId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_marketId_idx" ON "payment_webhook_events"("marketId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_status_idx" ON "payment_webhook_events"("status");

-- CreateIndex
CREATE INDEX "payment_webhook_events_receivedAt_idx" ON "payment_webhook_events"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "refund_records_internalReference_key" ON "refund_records"("internalReference");

-- CreateIndex
CREATE INDEX "refund_records_invoicePaymentId_idx" ON "refund_records"("invoicePaymentId");

-- CreateIndex
CREATE INDEX "refund_records_vendorId_idx" ON "refund_records"("vendorId");

-- CreateIndex
CREATE INDEX "refund_records_marketId_idx" ON "refund_records"("marketId");

-- CreateIndex
CREATE INDEX "refund_records_status_idx" ON "refund_records"("status");

-- CreateIndex
CREATE INDEX "refund_records_requestedAt_idx" ON "refund_records"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_payments_paymentAttemptId_key" ON "invoice_payments"("paymentAttemptId");

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_paymentAttemptId_fkey" FOREIGN KEY ("paymentAttemptId") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_supersededByAttemptId_fkey" FOREIGN KEY ("supersededByAttemptId") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempt_invoices" ADD CONSTRAINT "payment_attempt_invoices_paymentAttemptId_fkey" FOREIGN KEY ("paymentAttemptId") REFERENCES "payment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempt_invoices" ADD CONSTRAINT "payment_attempt_invoices_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "rent_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_paymentAttemptId_fkey" FOREIGN KEY ("paymentAttemptId") REFERENCES "payment_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_invoicePaymentId_fkey" FOREIGN KEY ("invoicePaymentId") REFERENCES "invoice_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_records" ADD CONSTRAINT "refund_records_invoicePaymentId_fkey" FOREIGN KEY ("invoicePaymentId") REFERENCES "invoice_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_records" ADD CONSTRAINT "refund_records_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_records" ADD CONSTRAINT "refund_records_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

