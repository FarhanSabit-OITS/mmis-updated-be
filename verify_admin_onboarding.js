const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function verifyOnboardingFlow() {
  console.log('🚀 Starting Admin Onboarding Logic Verification...');

  try {
    // 1. Simulate Super Admin Invitation
    const email = `test.admin.${Date.now()}@mmis.ug`;
    console.log(`\n[1/4] Generating Invitation for: ${email}`);
    
    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await prisma.invitation.create({
      data: {
        email,
        recipientName: 'Verification Test Admin',
        invitationType: 'ADMIN_ONBOARDING',
        token,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        metadata: {
            temporaryPassword: 'TempPassword123!',
            adminLevel: 'REGIONAL'
        }
      }
    });
    console.log(`✅ Invitation created. ID: ${invitation.id}`);

    // 2. Simulate Market Authority Code Generation
    console.log(`\n[2/4] Generating MA Handshake Code for Invitation ID: ${invitation.id}`);
    const handshakeCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const handshake = await prisma.handshakeCode.create({
      data: {
        invitationId: invitation.id,
        code: handshakeCode,
        issuedById: 'SYSTEM_TEST_PROCESS',
        isUsed: false,
        expiresAt: new Date(Date.now() + 3600000)
      }
    });
    console.log(`✅ Handshake Code Issued: ${handshakeCode}`);

    // 3. Simulate Candidate Verification
    console.log(`\n[3/4] Verifying Handshake Code...`);
    const foundInvitation = await prisma.invitation.findUnique({
      where: { token: token },
      include: { handshakeCode: true }
    });

    if (foundInvitation && foundInvitation.handshakeCode) {
      if (foundInvitation.handshakeCode.code === handshakeCode && !foundInvitation.handshakeCode.isUsed) {
        console.log('✅ Logic Success: Handshake code matched and is available.');
        
        // Mark as used
        await prisma.handshakeCode.update({
          where: { id: foundInvitation.handshakeCode.id },
          data: { isUsed: true, usedAt: new Date() }
        });
        console.log('✅ Handshake code marked as USED.');
      } else {
        throw new Error('❌ Verification Failed: Handshake code not found or already used.');
      }
    }

    // 4. Test Emergency Lock
    console.log(`\n[4/4] Testing Emergency Lock Revocation...`);
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'REVOKED' }
    });
    
    const revoked = await prisma.invitation.findUnique({ where: { id: invitation.id } });
    if (revoked.status === 'REVOKED') {
      console.log('✅ Emergency Lock logic verified: Invitation status is REVOKED.');
    }

    console.log('\n✨ All Admin Onboarding logic checks PASSED.');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyOnboardingFlow();
