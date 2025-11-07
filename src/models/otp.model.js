// src/models/otp.model.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    purpose: { type: String, default: "verify_email" }, // e.g., verify_email, reset_password, two_factor
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
