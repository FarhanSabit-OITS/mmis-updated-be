const prisma = require("../shared/prisma");
const { asyncHandler, ApiResponse } = require("../utils");
const crypto = require("crypto");

module.exports = {
  processPayment: asyncHandler(async (req, res) => {
    const { amount, method, description, taxAmount } = req.body;
    const userId = req.user.id;

    const stakeholder = await prisma.stakeholder.findUnique({
        where: { userId }
    });

    if (!stakeholder) {
        return res.status(400).json({ success: false, message: "User must have a stakeholder profile to initiate payment" });
    }

    const stakeholderId = stakeholder.id;

    const transaction = await prisma.transaction.create({
      data: {
        stakeholderId,
        type: "GENERAL_PAYMENT",
        amount,
        paymentMethod: method,
        status: "COMPLETED",
        referenceId: `TXN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
        metadata: { description, taxAmount }
      }
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        success: true,
        data: { txId: transaction.id, reference: transaction.referenceId },
        message: "Payment processed successfully"
      })
    );
  })
};
