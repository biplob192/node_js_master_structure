// src/services/user.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import ApiError from "../utils/ApiError.js";

// Example In-memory storage for user tokens
// In production, consider using a database or persistent storage
let userTokens = {}; // { userId: [token1, token2, ...] }

// In-memory blacklist (you can persist this later)
let tokenBlacklist = [];

// HELPER — Check if token is blacklisted
// export const isTokenBlacklisted = (token) => tokenBlacklist.includes(token);

export const isTokenBlacklisted = async (token) => {
  // For the time being, fake async delay (future-proof)
  return Promise.resolve(tokenBlacklist.includes(token));
};

// --------------------
// REGISTER USER SERVICE
// --------------------
export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");

    // const error = new Error("Email already registered");
    // error.status = 409; // Conflict
    // throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

// --------------------
// LOGIN USER SERVICE
// --------------------
export const loginUser = async (data, deviceInfo = "Unknown device") => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  // Invalidate old tokens (optional)
  if (userTokens[user._id]) {
    tokenBlacklist.push(...userTokens[user._id]);
  }

  // Generate new token
  const token = jwt.sign({ id: user._id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  // Calculate expiry time (JWT 'exp' claim এর সমান)
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  // Save this session
  await Session.create({
    userId: user._id,
    token,
    deviceInfo,
    expiresAt,
    valid: true,
  });

  // Save new token for that user
  userTokens[user._id] = [token];

  return {
    token,
    expiresIn: config.jwt.expiresIn,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

// --------------------
// LOGOUT USER SERVICE
// --------------------
export const logoutUser = async (token) => {
  if (!token) throw new ApiError(400, "Token is required");
  tokenBlacklist.push(token);
  return true;
};

// --------------------
// LOGOUT CURRENT DEVICE SERVICE
// --------------------
export const logoutCurrentDeviceService = async (token) => {
  if (!token) throw new ApiError(400, "Token is required");

  const session = await Session.findOne({ token, valid: true });
  if (!session) throw new ApiError(404, "Session not found or already logged out");

  session.valid = false;
  await session.save();

  return { success: true, message: "Logged out from current device" };
};


export const logoutOtherDevices = async (userId, currentToken) => {
  const sessions = await Session.updateMany(
    { userId, token: { $ne: currentToken }, valid: true },
    { $set: { valid: false } }
  );

  return { success: true, message: `${sessions.modifiedCount} other devices logged out` };
};



// --------------------
// GET USER PROFILE SERVICE
// --------------------
// export const getUserProfile = async (userId, tokenExp) => {
//   const user = await User.findById(userId).select("-password");
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   const tokenInfo = tokenExp
//     ? {
//         expiresAt: new Date(tokenExp * 1000),
//         remainingSeconds: tokenExp - Math.floor(Date.now() / 1000),
//       }
//     : null;

//   return { user, tokenInfo };
// };

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};
