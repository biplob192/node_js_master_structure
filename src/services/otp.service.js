// src/services/otp.service.js

import Otp from "../models/otp.model.js";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { verifyUserExistenceService } from "./auth.service.js";
import { generateRandomOtp, sendEmailOtp } from "../utils/otp.util.js";

// Generate OTP Service
export const generateOtpService = async (userId, purpose = "verify_email") => {
  // Before generating new OTP, check if an unexpired OTP exists
  const existingOtp = await Otp.findOne({ userId, purpose });

  if (existingOtp && existingOtp.expiresAt > new Date(Date.now() - config.otp.cooldownMs)) {
    throw new ApiError(429, "Please wait before requesting another OTP");
  }

  // Generate a 6-digit OTP with expiry time from config
  const otp = generateRandomOtp();
  const expiresAt = new Date(Date.now() + config.otp.expiryMs);

  // Store or update existing OTP
  await Otp.findOneAndUpdate({ userId, purpose }, { otp, expiresAt }, { upsert: true, new: true });

  return otp;
};

// export const sendOtpService = async (value) => {
export const sendOtpService = async ({ userId, email, purpose = "verify_email", viaSms = false }) => {
  // Validate input - at least one of userId or email must be provided
  if (!userId && !email) {
    throw new ApiError(400, "Either userId or email must be provided");
  }

  // Validate user existence
  const user = await verifyUserExistenceService({ userId, email });

  // Generate new OTP for the user using the service
  const otp = await generateOtpService(user.id, "verify_email");

  // Send OTP via email
  await sendEmailOtp(user.email, otp, "Email Verification");

  // Optionally send via SMS
  // if (user.phone) await sendSmsOtp(user.phone, otp, "Phone Verification");

  // Return user info or success message
  return user;
};

// Verify OTP Service
export const verifyOtpService = async (userId, otp, purpose = "verify_email") => {
  // Find OTP record
  const otpRecord = await Otp.findOne({ userId, otp, purpose });

  // If not found or expired, throw error
  if (!otpRecord) throw new ApiError(400, "Invalid OTP");
  if (otpRecord.expiresAt < Date.now()) throw new ApiError(400, "OTP expired");

  // OTP is valid, return record (optional)
  return otpRecord;
};

export const deleteUserOtpsService = async (userId) => {
  await Otp.deleteMany({ userId });
};
