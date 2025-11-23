// src/services/otp.service.js

import Otp from "../models/otp.model.js";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { verifyUserExistenceService } from "./auth.service.js";
import { withTransaction } from "../utils/databaseTransaction.js";
import { generateRandomOtp, sendOtpEmailService, sendOtpSmsService } from "../utils/otp.util.js";

// Generate OTP Service
export const generateOtpService = withTransaction(async (data, session) => {
  // Extract userId and purpose
  const { userId, purpose = "verify_email" } = data;

  // Check if userId is provided
  if (!userId) throw new ApiError(400, "User ID is required");

  // Before generating new OTP, check if an unexpired OTP exists
  const existingOtp = await Otp.findOne({ userId, purpose }).session(session);

  if (existingOtp && existingOtp.expiresAt > new Date(Date.now() - config.otp.cooldownMs)) {
    throw new ApiError(429, "Please wait before requesting another OTP");
  }

  // Generate a 6-digit OTP with expiry time from config
  const otp = generateRandomOtp();
  const expiresAt = new Date(Date.now() + config.otp.expiryMs);

  // Store or update existing OTP
  const otpDoc = await Otp.findOneAndUpdate({ userId, purpose }, { otp, expiresAt }, { upsert: true, new: true, session });

  return otpDoc;
});

// export const sendOtpService = async (value) => {
export const sendOtpService = async (data) => {
  // Destructure data to get userId, email, purpose and viaSms
  const { user: userData, otp: otpData, viaSms = false } = data;

  // Send OTP via email
  await sendOtpEmailService({
    email: userData.email,
    otp: otpData.otp,
    purpose: otpData.purpose,
  });

  // Optionally send via SMS
  // if (userData.phone && viaSms)
  //   await sendOtpSmsService({
  //     phoneNumber: userData.phone,
  //     otp: otpData.otp,
  //     purpose: otpData.purpose,
  //   });

  // Return user info or success message
  return true;
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

// Generate and send OTP Service
export const generateAndSendOtpService = withTransaction(async (data, session) => {
  // Check if user exists
  const user = await verifyUserExistenceService(data);

  // Generate and store OTP record
  const otp = await generateOtpService({userId: user._id}, session);

  // Send OTP via Email or SMS
  await sendOtpService({ user, otp });

  return otp;
});
