-- This migration exists to preserve non-destructive replay order.
-- The invoice-generation tables are created in 20260421130000_add_invoice_generation_billing,
-- so invoice/billing table alterations must happen after that migration when a shadow
-- database is replayed from scratch.

ALTER TABLE "invoice_generation_run_items" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "invoice_generation_runs" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "invoice_payments" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "payment_allocations" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "payment_claims" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "rent_invoice_lines" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "rent_invoices" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "vendor_billing_statuses" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "vendor_credits" ALTER COLUMN "updatedAt" DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'rent_invoices_rentContractId_billingYear_billingMonth_invoiceVe'
  ) THEN
    ALTER INDEX "rent_invoices_rentContractId_billingYear_billingMonth_invoiceVe"
      RENAME TO "rent_invoices_rentContractId_billingYear_billingMonth_invoi_key";
  END IF;
END $$;
