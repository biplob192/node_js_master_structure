// src/services/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import Session from "../models/session.model.js";

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
export const registerUserService = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
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
export const loginUserService = async (data, deviceInfo = "Unknown device") => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  // Generate token using helper
  const { token, expiresIn } = await createToken(user, deviceInfo);

  return {
    token,
    expiresIn,
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
export const logoutUserService = async (token) => {
  if (!token) throw new ApiError(400, "Token is required");
  tokenBlacklist.push(token);
  return true;
};

// --------------------
// LOGOUT OTHER DEVICES SERVICE
// --------------------
export const logoutOtherDevicesService = async (currentToken) => {
  try {
    // Verify and decode the current token
    const decoded = jwt.verify(currentToken, config.jwt.secret);
    const userId = decoded.id;

    // Find the current valid session
    const currentSession = await Session.findOne({ userId, token: currentToken, valid: true });
    if (!currentSession) {
      throw new ApiError(401, "Invalid or expired session");
    }

    // Invalidate all other sessions for this user except the current one
    await Session.updateMany({ userId, token: { $ne: currentToken }, valid: true }, { $set: { valid: false } });

    return { message: "Logged out from all other devices successfully" };
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    throw err;
  }
};

// Common Token Generator + Session Saver
export const createToken = async (user, deviceInfo = "Unknown device") => {
  try {
    // Invalidate all existing sessions for this user
    // await Session.updateMany({ userId: user._id, valid: true }, { $set: { valid: false } });

    // Invalidate old sessions for this user & this specific device
    await Session.updateMany({ userId: user._id, deviceInfo, valid: true }, { $set: { valid: false } });

    // Optional: Invalidate old tokens by adding them to the blacklist
    // if (userTokens[user._id]) {
    //   tokenBlacklist.push(...userTokens[user._id]);
    // }

    // Optionally add previous tokens from this device to the blacklist
    if (userTokens[user._id]?.[deviceInfo]) {
      tokenBlacklist.push(...userTokens[user._id][deviceInfo]);
    }

    // Generate a new JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

    // Decode token to calculate expiration time
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Save the session to the database
    await Session.create({
      userId: user._id,
      token,
      deviceInfo,
      expiresAt,
      valid: true,
    });

    // Cache the new token for this user
    // userTokens[user._id] = [token];

    // Cache tokens per user per device
    if (!userTokens[user._id]) userTokens[user._id] = {};
    userTokens[user._id][deviceInfo] = [token];

    return {
      token,
      expiresIn: config.jwt.expiresIn,
    };
  } catch (err) {
    throw new ApiError(500, "Error generating token");
  }
};
