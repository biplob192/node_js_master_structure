// src/controllers/auth.controller.js

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Session from "../models/session.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteUserOtpsService, verifyOtpService, sendOtpService } from "../services/otp.service.js";
import { registerValidation, loginValidation, verifyOtpValidation, verifyResendOtpValidation } from "../validations/user.validation.js";
import {
  registerUserService,
  verifyUserAndGenerateTokens,
  loginUserService,
  logoutUserService,
  logoutOtherDevicesService,
  refreshTokenService,
} from "../services/auth.service.js";

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

    // Call service to handle User validation, OTP generation, and sending
    await sendOtpService({ userId: user.id });

    // Send response indicating OTP sent
    return ApiResponse.success(res, "OTP sent to your email for verification", user, 201);
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

  // Capture device_id if provided (important for session management)
  const deviceId = req.body.device_id || req.headers["device-id"];

  // Perform login logic
  const result = await loginUserService(value, deviceId, deviceInfo);

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

// VERIFY OTP
export const verifyOtp = async (req, res, next) => {
  // Validate request body and throw error if invalid
  const { error, value } = verifyOtpValidation.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Extract validated values
  const { userId, otp, deviceId, deviceInfo } = value;

  // Verify OTP only
  await verifyOtpService(userId, otp);

  // Delete all the OTPs for the user after successful verification
  // await deleteUserOtpsService(userId);

  // Mark user verified & generate tokens
  // const result = await verifyUserAndGenerateTokens(userId, deviceId, deviceInfo);
  const { user, formatedTokens } = await verifyUserAndGenerateTokens(userId, deviceId, deviceInfo);

  // Send response
  return ApiResponse.success(res, "User verified successfully", { user, ...formatedTokens });
};

// RESEND OTP
export const resendOtp = async (req, res, next) => {
  // Validate request body and throw error if invalid
  const { error, value } = verifyResendOtpValidation.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Call service to handle User validation, OTP generation, and sending
  const result = await sendOtpService({ userId: value.userId, email: value.email });

  // Send response
  return ApiResponse.success(res, "A new OTP has been sent to your registered email.", result);
};

// LOGOUT OTHER DEVICE
export const logoutOtherDevices = async (req, res, next) => {
  // Perform logout from other devices logic
  const data = await logoutOtherDevicesService(req.accessToken);

  // Send success response
  return ApiResponse.success(res, data.message, null);
};

// REFRESH TOKEN
export const refreshToken = async (req, res, next) => {
  const { rotateAllTokens } = req.body;
  const userId = req.decodedRefreshToken.id;
  const refreshToken = req.refreshToken;

  // Generate new tokens
  const tokens = await refreshTokenService(userId, refreshToken, rotateAllTokens);

  // Send success response
  return ApiResponse.success(res, "Token refresh successful", tokens);
};
