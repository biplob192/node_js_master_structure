// src/utils/ApiError.js

export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // identify predictable errors
  }
}

// Usage example in a controller:
// import ApiError from "../utils/ApiError.js";
// throw new ApiError(400, "Email already exists");