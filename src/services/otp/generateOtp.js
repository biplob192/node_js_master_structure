// src/services/otp/generateOtp.js

import crypto from "crypto";
import Otp from "../../models/otp.model.js";

export const generateOtp = async (userId, purpose = "verify_email") => {
  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // OTP expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Save or update OTP in DB
  await Otp.findOneAndUpdate(
    { userId, purpose },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  return otp;
};
