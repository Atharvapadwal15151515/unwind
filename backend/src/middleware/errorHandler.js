import AppError from "../utils/AppError.js";

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message
    });
  }

  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists"
    });
  }

  if (error.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Invalid related record"
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message || "Internal server error"
  });
}