/*
  Warnings:

  - The values [CANCELLED] on the enum `InvitationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [USER_REGISTRATION] on the enum `VerificationTokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvitationStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED', 'USED');
ALTER TABLE "public"."invitations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invitations" ALTER COLUMN "status" TYPE "InvitationStatus_new" USING ("status"::text::"InvitationStatus_new");
ALTER TYPE "InvitationStatus" RENAME TO "InvitationStatus_old";
ALTER TYPE "InvitationStatus_new" RENAME TO "InvitationStatus";
DROP TYPE "public"."InvitationStatus_old";
ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvitationType" ADD VALUE 'ADMIN_ONBOARDING';
ALTER TYPE "InvitationType" ADD VALUE 'VENDOR_REGISTRATION';
ALTER TYPE "InvitationType" ADD VALUE 'SUPPLIER_REGISTRATION';
ALTER TYPE "InvitationType" ADD VALUE 'KYC_VERIFICATION';

-- AlterEnum
BEGIN;
CREATE TYPE "VerificationTokenType_new" AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_RECOVERY', 'ADMIN_INVITATION', 'KYC_VERIFICATION');
ALTER TABLE "verification_tokens" ALTER COLUMN "tokenType" TYPE "VerificationTokenType_new" USING ("tokenType"::text::"VerificationTokenType_new");
ALTER TYPE "VerificationTokenType" RENAME TO "VerificationTokenType_old";
ALTER TYPE "VerificationTokenType_new" RENAME TO "VerificationTokenType";
DROP TYPE "public"."VerificationTokenType_old";
COMMIT;
