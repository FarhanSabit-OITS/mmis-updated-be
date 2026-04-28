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
ALTER TABLE "invitations" DROP CONSTRAINT IF EXISTS "invitations_roleId_fkey";
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_marketId_fkey";
DROP INDEX IF EXISTS "notifications_marketId_idx";
DROP INDEX IF EXISTS "user_profiles_mmisId_key";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "dismissedAt",
DROP COLUMN "marketId",
DROP COLUMN "requiresDismissal",
DROP COLUMN "targetRole",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "mmisId";
