const { z } = require("zod");
const { Prisma } = require("@prisma/client");
const { AppError } = require("../errors/app.errors");

const errorHandler = (err, req, res, next) => {
  console.log(err)
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = err.meta?.target?.join(", ");
      return res.status(409).json({
        success: false,
        message: `Duplicate value for field: ${fields}`,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: err.meta?.cause || "Record not found",
      });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Related record not found",
      });
    }

    if (err.code === "P2011") {
      return res.status(400).json({
        success: false,
        message: "Required field is missing",
      });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};

module.exports = errorHandler;