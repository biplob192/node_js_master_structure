// src/services/otp.service.js

import Otp from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";

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
