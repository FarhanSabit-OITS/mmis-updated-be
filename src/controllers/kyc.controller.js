const { NotFoundError } = require("../errors/app.errors");
const { asyncHandler, ApiResponse } = require("../utils");
const prisma = require("../shared/prisma");

module.exports = {
  submitKyc: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { nationalId, nationalIdType, residentialAddress, businessType, metadata } = req.body;
    
    let stakeholder = await prisma.stakeholder.findUnique({
      where: { userId }
    });

    if (!stakeholder) {
        // Create stakeholder profile if it doesn't exist
        stakeholder = await prisma.stakeholder.create({
            data: { userId, stakeholderType: "VENDOR" } // Defaulting to VENDOR for now
        });
    }

    const stakeholderId = stakeholder.id;

    // Start transaction to update both stakeholder status and user profile
    await prisma.$transaction([
      prisma.stakeholder.update({
        where: { id: stakeholderId },
        data: { 
          kycStatus: "PENDING",
          kycSubmittedAt: new Date(),
          metadata: metadata || {}
        }
      }),
      prisma.userProfile.update({
        where: { userId },
        data: {
          nationalIdType: nationalIdType || "NIN",
          nationalId: nationalId,
          residentialAddress: residentialAddress
        }
      })
    ]);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        message: "KYC data submitted successfully"
      })
    );
  }),

  getKycDetail: asyncHandler(async (req, res) => {
    let { stakeholderId } = req.params;
    
    if (!stakeholderId || stakeholderId === 'status') {
        const stakeholder = await prisma.stakeholder.findUnique({
            where: { userId: req.user.id }
        });
        if (!stakeholder) throw new NotFoundError("Stakeholder profile not found");
        stakeholderId = stakeholder.id;
    }
    
    const stakeholder = await prisma.stakeholder.findUnique({
      where: { id: stakeholderId },
      include: { 
        user: { include: { profile: true } },
        documents: true 
      }
    });

    if (!stakeholder) throw new NotFoundError("Stakeholder not found");

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: {
          kycStatus: stakeholder.kycStatus,
          taxIdNumber: stakeholder.user?.profile?.taxIdNumber,
          identification: {
            type: stakeholder.user?.profile?.nationalIdType,
            number: stakeholder.user?.profile?.nationalId
          },
          address: stakeholder.user?.profile?.residentialAddress,
          documents: stakeholder.documents
        },
        message: "KYC details fetched successfully"
      })
    );
  }),

  reviewKyc: asyncHandler(async (req, res) => {
    const { stakeholderId, status, notes } = req.body; // stakeholderId from body for POST /review

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status. Use VERIFIED or REJECTED." });
    }

    const stakeholder = await prisma.stakeholder.findUnique({
      where: { id: stakeholderId }
    });

    if (!stakeholder) throw new NotFoundError("Stakeholder not found");

    await prisma.stakeholder.update({
      where: { id: stakeholderId },
      data: { 
        kycStatus: status,
        kycVerifiedAt: status === 'VERIFIED' ? new Date() : null,
        kycVerifiedByAdminId: req.user.id, // Assuming admin is reviewing
        notes: notes || undefined
      }
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        message: `KYC ${status.toLowerCase()} successfully`
      })
    );
  })
};
