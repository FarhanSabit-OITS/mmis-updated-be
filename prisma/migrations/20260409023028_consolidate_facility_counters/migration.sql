/*
  Warnings:

  - You are about to drop the column `totalShops` on the `market_levels` table. All the data in the column will be lost.
  - You are about to drop the column `totalStalls` on the `market_levels` table. All the data in the column will be lost.
  - You are about to drop the column `occupiedShops` on the `market_sections` table. All the data in the column will be lost.
  - You are about to drop the column `occupiedStalls` on the `market_sections` table. All the data in the column will be lost.
  - You are about to drop the column `totalShops` on the `market_sections` table. All the data in the column will be lost.
  - You are about to drop the column `totalStalls` on the `market_sections` table. All the data in the column will be lost.
  - You are about to drop the column `occupiedShops` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `occupiedStalls` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `totalLevels` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `totalSections` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `totalShops` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `totalStalls` on the `markets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "market_levels" DROP COLUMN "totalShops",
DROP COLUMN "totalStalls",
ADD COLUMN     "totalFacilities" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "market_sections" DROP COLUMN "occupiedShops",
DROP COLUMN "occupiedStalls",
DROP COLUMN "totalShops",
DROP COLUMN "totalStalls",
ADD COLUMN     "occupiedFacilities" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalFacilities" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "markets" DROP COLUMN "occupiedShops",
DROP COLUMN "occupiedStalls",
DROP COLUMN "totalLevels",
DROP COLUMN "totalSections",
DROP COLUMN "totalShops",
DROP COLUMN "totalStalls",
ADD COLUMN     "occupiedFacilities" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalFacilities" INTEGER NOT NULL DEFAULT 0;
