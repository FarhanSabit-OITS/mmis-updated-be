const { NotFoundError } = require("../errors/app.errors");
const { asyncHandler, ApiResponse } = require("../utils");
const prisma = require("../shared/prisma");

module.exports = {
  uploadDocument: asyncHandler(async (req, res) => {
    const { documentType, stakeholderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!documentType || !stakeholderId) {
      return res.status(400).json({ success: false, message: "documentType and stakeholderId are required" });
    }

    // Save to DB
    const document = await prisma.document.create({
      data: {
        documentType,
        documentNumber: `DOC-${Date.now().toString().slice(-6)}`,
        fileUrl: `/uploads/${file.filename}`, // Mock URL for local storage
        status: "PENDING_VERIFICATION",
        stakeholderId,
      }
    });

    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        success: true,
        data: document,
        message: "Document uploaded successfully"
      })
    );
  }),

  getDocuments: asyncHandler(async (req, res) => {
    const { stakeholderId } = req.query;

    const documents = await prisma.document.findMany({
      where: stakeholderId ? { stakeholderId } : {},
      include: { stakeholder: { include: { user: { select: { email: true, phone: true } } } } },
      orderBy: { uploadedAt: "desc" }
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: documents,
        message: "Documents fetched successfully"
      })
    );
  }),

  getDocumentDetails: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { stakeholder: true }
    });

    if (!document) throw new NotFoundError("Document not found");

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: document,
        message: "Document details fetched successfully"
      })
    );
  }),

  verifyDocument: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const staffId = req.user.id;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use VERIFIED or REJECTED" });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        status,
        verifiedById: staffId,
        verificationDate: new Date(),
        // Add remarks to metadata or notes if the schema supported it. We just update status for now.
      }
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: document,
        message: `Document ${status.toLowerCase()} successfully`
      })
    );
  })
};
