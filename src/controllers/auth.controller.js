// src/controllers/auth.controller.js

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerValidation, loginValidation } from "../validations/user.validation.js";
import { registerUserService, loginUserService, logoutUserService, logoutOtherDevicesService } from "../services/auth.service.js";

// --------------------
// Try-catch is not strictly necessary here due to wrapRoutes,
// but included for clarity on error handling.
// --------------------

// REGISTER
export const register = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    // Perform registration logic
    const user = await registerUserService(value);

    // Send success response
    return ApiResponse.success(res, "User registered successfully", user, 201);
  } catch (err) {
    next(err); // Let the global error handler deal with it
  }
};

// LOGIN
export const login = async (req, res, next) => {
  // Validate request body
  const { error, value } = loginValidation.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  // If client sends "device_info" in the request body or headers, capture it
  const deviceInfo = req.body.device_info || req.headers["device-info"] || "Unknown device";

  // Perform login logic
  const result = await loginUserService(value, deviceInfo);

  // Send success response
  return ApiResponse.success(res, "Login successful", result, 200);
};

// LOGOUT
export const logout = async (req, res, next) => {
  // Perform logout logic
  const data = await logoutUserService(req.token);

  // Send success response
  return ApiResponse.success(res, "Logged out successfully", null);
};

// LOGOUT OTHER DEVICE
export const logoutOtherDevices = async (req, res, next) => {
  // Perform logout from other devices logic
  const data = await logoutOtherDevicesService(req.token);

  // Send success response
  return ApiResponse.success(res, data.message, null);
};

// REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) throw new ApiError(400, "Missing refresh token");

  // Verify refresh token
  const decoded = jwt.verify(refresh_token, config.jwt.secret);

  // Check if session exists and is valid
  const session = await Session.findOne({ refreshToken: refresh_token, valid: true });
  if (!session) throw new ApiError(401, "Invalid or expired session");

  // Generate new access token
  const newAccessToken = jwt.sign({ id: decoded.id, email: decoded.email, type: "access" }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  // Update session record
  session.token = newAccessToken;
  session.expiresAt = new Date(jwt.decode(newAccessToken).exp * 1000);
  await session.save();

  res.json({
    access_token: newAccessToken,
    expires_in: config.jwt.expiresIn,
  });
});
