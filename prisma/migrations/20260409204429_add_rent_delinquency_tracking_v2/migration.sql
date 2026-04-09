-- AlterTable
ALTER TABLE "rent_payments" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "daysOverdue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "delinquencyStage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isDelinquent" BOOLEAN NOT NULL DEFAULT false;
