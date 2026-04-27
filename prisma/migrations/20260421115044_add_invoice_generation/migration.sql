/*
  Warnings:

  - You are about to drop the column `dismissedAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `marketId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `requiresDismissal` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `targetRole` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `mmisId` on the `user_profiles` table. All the data in the column will be lost.
  - Made the column `userId` on table `notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_roleId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_marketId_fkey";

-- DropIndex
DROP INDEX "notifications_marketId_idx";

-- DropIndex
DROP INDEX "user_profiles_mmisId_key";

-- AlterTable
ALTER TABLE "invoice_generation_run_items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoice_generation_runs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "invoice_payments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "dismissedAt",
DROP COLUMN "marketId",
DROP COLUMN "requiresDismissal",
DROP COLUMN "targetRole",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "payment_allocations" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment_claims" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rent_invoice_lines" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rent_invoices" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "mmisId";

-- AlterTable
ALTER TABLE "vendor_billing_statuses" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "vendor_credits" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "rent_invoices_rentContractId_billingYear_billingMonth_invoiceVe" RENAME TO "rent_invoices_rentContractId_billingYear_billingMonth_invoi_key";
