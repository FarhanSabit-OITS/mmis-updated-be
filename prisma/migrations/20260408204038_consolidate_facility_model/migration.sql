/*
  Warnings:

  - You are about to drop the column `stallId` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `gate_entries` table. All the data in the column will be lost.
  - You are about to drop the column `visitedStalls` on the `guest_entries` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `health_inspections` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `market_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `rent_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `stallId` on the `supplier_invoices` table. All the data in the column will be lost.
  - You are about to drop the `shop_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shops` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stall_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stalls` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `facilityId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `gate_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `health_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `rent_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityId` to the `supplier_invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('SHOP', 'STALL', 'WAREHOUSE', 'KIOSK', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "OccupationStatus" AS ENUM ('VACANT', 'OCCUPIED', 'RESERVED', 'LOCKED');

-- DropForeignKey
ALTER TABLE "gate_entries" DROP CONSTRAINT "gate_entries_stallId_fkey";

-- DropForeignKey
ALTER TABLE "health_inspections" DROP CONSTRAINT "health_inspections_stallId_fkey";

-- DropForeignKey
ALTER TABLE "market_tokens" DROP CONSTRAINT "market_tokens_stallId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_stallId_fkey";

-- DropForeignKey
ALTER TABLE "rent_contracts" DROP CONSTRAINT "rent_contracts_shopId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_stallId_fkey";

-- DropForeignKey
ALTER TABLE "shop_assets" DROP CONSTRAINT "shop_assets_createdById_fkey";

-- DropForeignKey
ALTER TABLE "shop_assets" DROP CONSTRAINT "shop_assets_shopId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_createdById_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_levelId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_marketId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_marketMasterId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_memberId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "stall_assets" DROP CONSTRAINT "stall_assets_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stall_assets" DROP CONSTRAINT "stall_assets_stallId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_aisleId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_levelId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_marketId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_marketMasterId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_shopId_fkey";

-- DropForeignKey
ALTER TABLE "stalls" DROP CONSTRAINT "stalls_vendorId_fkey";

-- DropIndex
DROP INDEX "complaints_stallId_idx";

-- DropIndex
DROP INDEX "deliveries_stallId_idx";

-- DropIndex
DROP INDEX "health_inspections_stallId_idx";

-- DropIndex
DROP INDEX "products_stallId_idx";

-- DropIndex
DROP INDEX "rent_contracts_shopId_idx";

-- DropIndex
DROP INDEX "sales_stallId_idx";

-- DropIndex
DROP INDEX "stock_movements_stallId_idx";

-- DropIndex
DROP INDEX "supplier_invoices_stallId_idx";

-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT;

-- AlterTable
ALTER TABLE "deliveries" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "gate_entries" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "guest_entries" DROP COLUMN "visitedStalls",
ADD COLUMN     "visitedFacilities" TEXT[];

-- AlterTable
ALTER TABLE "health_inspections" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "market_tokens" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "rent_contracts" DROP COLUMN "shopId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT;

-- AlterTable
ALTER TABLE "supplier_invoices" DROP COLUMN "stallId",
ADD COLUMN     "facilityId" TEXT NOT NULL;

-- DropTable
DROP TABLE "shop_assets";

-- DropTable
DROP TABLE "shops";

-- DropTable
DROP TABLE "stall_assets";

-- DropTable
DROP TABLE "stalls";

-- DropEnum
DROP TYPE "ShopType";

-- DropEnum
DROP TYPE "StallType";

-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "levelId" TEXT,
    "sectionId" TEXT,
    "aisleId" TEXT,
    "memberId" TEXT NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "unitNumber" VARCHAR(20) NOT NULL,
    "displayName" VARCHAR(150),
    "facilityName" VARCHAR(200),
    "type" "FacilityType" NOT NULL DEFAULT 'SHOP',
    "subType" VARCHAR(100),
    "category" VARCHAR(100),
    "tags" TEXT[],
    "locationDescription" VARCHAR(500),
    "hasElectricity" BOOLEAN NOT NULL DEFAULT true,
    "hasWaterSupply" BOOLEAN NOT NULL DEFAULT true,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasLighting" BOOLEAN NOT NULL DEFAULT true,
    "hasPowerOutlet" BOOLEAN NOT NULL DEFAULT true,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "hasSecurityShutter" BOOLEAN NOT NULL DEFAULT true,
    "hasDisplayCounter" BOOLEAN NOT NULL DEFAULT true,
    "electricityMeterNumber" VARCHAR(50),
    "waterMeterNumber" VARCHAR(50),
    "monthlyRent" DECIMAL(12,2),
    "dailyRate" DECIMAL(10,2),
    "securityDeposit" DECIMAL(12,2),
    "maintenanceFee" DECIMAL(10,2),
    "billingCycle" VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "status" "FacilityStatus" NOT NULL DEFAULT 'ACTIVE',
    "occupationStatus" "OccupationStatus" NOT NULL DEFAULT 'VACANT',
    "qrCode" VARCHAR(100),
    "createdById" TEXT NOT NULL,
    "marketMasterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_assets" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "assetType" VARCHAR(50) NOT NULL,
    "assetUrl" VARCHAR(500) NOT NULL,
    "fileName" VARCHAR(200) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VendorFacilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VendorFacilities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "facilities_uniqueCode_key" ON "facilities"("uniqueCode");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_qrCode_key" ON "facilities"("qrCode");

-- CreateIndex
CREATE INDEX "facilities_marketId_idx" ON "facilities"("marketId");

-- CreateIndex
CREATE INDEX "facilities_memberId_idx" ON "facilities"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_marketId_unitNumber_key" ON "facilities"("marketId", "unitNumber");

-- CreateIndex
CREATE INDEX "facility_assets_facilityId_idx" ON "facility_assets"("facilityId");

-- CreateIndex
CREATE INDEX "facility_assets_assetType_idx" ON "facility_assets"("assetType");

-- CreateIndex
CREATE INDEX "facility_assets_isActive_idx" ON "facility_assets"("isActive");

-- CreateIndex
CREATE INDEX "_VendorFacilities_B_index" ON "_VendorFacilities"("B");

-- CreateIndex
CREATE INDEX "complaints_facilityId_idx" ON "complaints"("facilityId");

-- CreateIndex
CREATE INDEX "deliveries_facilityId_idx" ON "deliveries"("facilityId");

-- CreateIndex
CREATE INDEX "gate_entries_facilityId_idx" ON "gate_entries"("facilityId");

-- CreateIndex
CREATE INDEX "health_inspections_facilityId_idx" ON "health_inspections"("facilityId");

-- CreateIndex
CREATE INDEX "products_facilityId_idx" ON "products"("facilityId");

-- CreateIndex
CREATE INDEX "rent_contracts_facilityId_idx" ON "rent_contracts"("facilityId");

-- CreateIndex
CREATE INDEX "sales_facilityId_idx" ON "sales"("facilityId");

-- CreateIndex
CREATE INDEX "stock_movements_facilityId_idx" ON "stock_movements"("facilityId");

-- CreateIndex
CREATE INDEX "supplier_invoices_facilityId_idx" ON "supplier_invoices"("facilityId");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "market_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "market_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES "market_aisles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_marketMasterId_fkey" FOREIGN KEY ("marketMasterId") REFERENCES "market_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_contracts" ADD CONSTRAINT "rent_contracts_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_inspections" ADD CONSTRAINT "health_inspections_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_assets" ADD CONSTRAINT "facility_assets_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_assets" ADD CONSTRAINT "facility_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendorFacilities" ADD CONSTRAINT "_VendorFacilities_A_fkey" FOREIGN KEY ("A") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendorFacilities" ADD CONSTRAINT "_VendorFacilities_B_fkey" FOREIGN KEY ("B") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
