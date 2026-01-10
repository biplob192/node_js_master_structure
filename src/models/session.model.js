// src/models/session.model.js

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, required: true }, 
  jti: { type: String },
  accessJti: { type: String },
  deviceInfo: { type: String },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  accessExpiresAt: { type: Date, required: true },
  refreshExpiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  valid: { type: Boolean, default: true },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Optional: auto-remove expired tokens

export default mongoose.model("Session", sessionSchema);
