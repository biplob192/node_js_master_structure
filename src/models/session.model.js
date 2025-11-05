// src/models/session.model.js

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: { type: String }, // optional (browser name, OS ইত্যাদি)
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  valid: { type: Boolean, default: true },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Optional: auto-remove expired tokens

export default mongoose.model("Session", sessionSchema);
