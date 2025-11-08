// src/models/user.model.js

import mongoose from "mongoose";
import { createMongooseTransform } from "../utils/mongooseTransform.util.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      // select: false, // Exclude from queries by default
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Automatically remove fields when converting to JSON
// userSchema.set("toJSON", {
//   transform: function (doc, ret) {
//     if (ret._id) {
//       ret.id = ret._id.toString();
//       delete ret._id;

//       ret = ret.id ? { id: ret.id, ...ret } : ret;
//     }

//     delete ret.password;
//     delete ret.__v; // optional, removes mongoose internal field
//     return ret;
//   },
// });

// Sensitive fields for this model
const SENSITIVE_FIELDS = ["password"];

// Apply the transform with sensitive fields removal, snake_case conversion, and id formatting
userSchema.set("toJSON", { transform: createMongooseTransform(SENSITIVE_FIELDS) });

const User = mongoose.model("User", userSchema);
export default User;
