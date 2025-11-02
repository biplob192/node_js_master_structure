// src/middlewares/error.middleware.js

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Handle known (operational) errors
  if (err instanceof ApiError) {
    return ApiResponse.fail(res, err.message, err.statusCode);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return ApiResponse.fail(res, err.message, 400);
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return ApiResponse.fail(res, message, 409);
  }

  // Handle JWT / Unauthorized errors (optional)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return ApiResponse.fail(res, "Invalid or expired token", 401);
  }

  // Catch-all for unexpected errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return ApiResponse.fail(res, message, statusCode);
};