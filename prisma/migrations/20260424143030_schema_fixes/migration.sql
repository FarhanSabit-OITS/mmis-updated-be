/*
  Warnings:

  - The `status` column on the `markets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `age` on the `user_profiles` table. All the data in the column will be lost.
  - Added the required column `marketId` to the `deliveries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED', 'UNDER_RENOVATION');

-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "marketId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "districts" ALTER COLUMN "geolocationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoice_generation_run_items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoice_generation_runs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoice_payments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "markets" DROP COLUMN "status",
ADD COLUMN     "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "payment_allocations" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment_claims" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "pseudo_market_admins" ADD COLUMN     "assignedSectionId" TEXT;

-- AlterTable
ALTER TABLE "qr_generation_configs" ADD COLUMN     "shopId" TEXT;

-- AlterTable
ALTER TABLE "rent_invoice_lines" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rent_invoices" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "age";

-- AlterTable
ALTER TABLE "vendor_billing_statuses" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "vendor_credits" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "deliveries_marketId_idx" ON "deliveries"("marketId");

-- AddForeignKey
ALTER TABLE "pseudo_market_admins" ADD CONSTRAINT "pseudo_market_admins_assignedSectionId_fkey" FOREIGN KEY ("assignedSectionId") REFERENCES "market_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_generation_configs" ADD CONSTRAINT "qr_generation_configs_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_generation_configs" ADD CONSTRAINT "qr_generation_configs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_paymentClaimId_fkey" FOREIGN KEY ("paymentClaimId") REFERENCES "payment_claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_regulations" ADD CONSTRAINT "market_regulations_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_licenses" ADD CONSTRAINT "business_licenses_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_licenses" ADD CONSTRAINT "business_licenses_licenseeId_fkey" FOREIGN KEY ("licenseeId") REFERENCES "stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "rent_invoices_rentContractId_billingYear_billingMonth_invoiceVe" RENAME TO "rent_invoices_rentContractId_billingYear_billingMonth_invoi_key";
