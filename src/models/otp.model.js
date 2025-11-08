// src/models/otp.model.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    purpose: { type: String, required: true, default: "verify_email" }, // e.g., verify_email, reset_password, two_factor
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index (deletes when expiresAt passes)
    },
  },
  { timestamps: true }
);

// Optional: compound index to avoid duplicates
otpSchema.index({ userId: 1, purpose: 1 }, { unique: true });

export default mongoose.model("Otp", otpSchema);
