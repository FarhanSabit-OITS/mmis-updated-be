/*
  Warnings:

  - The values [ADMIN_ONBOARDING,VENDOR_REGISTRATION,SUPPLIER_REGISTRATION,KYC_VERIFICATION] on the enum `InvitationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvitationType_new" AS ENUM ('USER_REGISTRATION', 'PASSWORD_RESET');
ALTER TABLE "invitations" ALTER COLUMN "invitationType" TYPE "InvitationType_new" USING ("invitationType"::text::"InvitationType_new");
ALTER TYPE "InvitationType" RENAME TO "InvitationType_old";
ALTER TYPE "InvitationType_new" RENAME TO "InvitationType";
DROP TYPE "public"."InvitationType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "VerificationTokenType" ADD VALUE 'USER_REGISTRATION';
