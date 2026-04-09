-- AlterEnum
ALTER TYPE "VerificationTokenType" ADD VALUE 'HANDSHAKE_CODE';

-- CreateTable
CREATE TABLE "handshake_codes" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "invitationId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "adminId" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handshake_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handshake_codes_code_key" ON "handshake_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "handshake_codes_invitationId_key" ON "handshake_codes"("invitationId");

-- CreateIndex
CREATE INDEX "handshake_codes_code_idx" ON "handshake_codes"("code");

-- CreateIndex
CREATE INDEX "handshake_codes_invitationId_idx" ON "handshake_codes"("invitationId");

-- AddForeignKey
ALTER TABLE "handshake_codes" ADD CONSTRAINT "handshake_codes_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handshake_codes" ADD CONSTRAINT "handshake_codes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
