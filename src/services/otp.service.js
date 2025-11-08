// src/services/otp.service.js

import Otp from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
import { verifyUserService } from "./auth.service.js";
import { generateOtp, sendEmailOtp } from "../utils/otp.util.js";

export const verifyOtpService = async (userId, otp) => {
  // Find OTP record
  const otpRecord = await Otp.findOne({ userId, otp });

  // If not found or expired, throw error
  if (!otpRecord) throw new ApiError(400, "Invalid OTP");
  if (otpRecord.expiresAt < Date.now()) throw new ApiError(400, "OTP expired");

  // OTP is valid, return record (optional)
  return otpRecord;
};

export const deleteUserOtps = async (userId) => {
  await Otp.deleteMany({ userId });
};

export const sendOtpService = async (value) => {
  // Validate user existence
  const user = await verifyUserService(value);

  // Generate new OTP
  const otp = await generateOtp(user.id, "verify_email");

  // Send OTP via email
  await sendEmailOtp(user.email, otp, "Email Verification");

  // Optionally send via SMS
  // if (user.phone) await sendSmsOtp(user.phone, otp, "Phone Verification");

  // Return user info or success message
  return user;
};
