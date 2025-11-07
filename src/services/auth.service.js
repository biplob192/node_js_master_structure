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
    isVerified: false,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

// --------------------
// VERIFY USER AND GENERATE TOKENS SERVICE
// --------------------
export const verifyUserAndGenerateTokens = async (userId, deviceId, deviceInfo) => {
  // Mark user as verified
  const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });

  // Generate tokens
  const tokens = await createToken(user, deviceId, deviceInfo);

  // Format tokens in snake_case for API response
  const formatedTokens = formatTokensToSnakeCase(tokens);

  // Return user and tokens
  return { user, formatedTokens };
};

// --------------------
// LOGIN USER SERVICE
// --------------------
export const loginUserService = async (data, deviceId, deviceInfo = "Unknown device") => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  // Generate token using helper
  const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = await createToken(user, deviceId, deviceInfo);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    refresh_expires_in: refreshExpiresIn,
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
    const currentSession = await Session.findOne({ userId, accessToken: currentToken, valid: true });
    if (!currentSession) {
      throw new ApiError(401, "Invalid or expired session");
    }

    // Invalidate all other sessions for this user except the current one
    await Session.updateMany({ userId, accessToken: { $ne: currentToken }, valid: true }, { $set: { valid: false } });

    return { message: "Logged out from all other devices successfully" };
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    throw err;
  }
};

// Common Token Generator + Session Saver with Refresh Token
export const createToken = async (user, deviceId, deviceInfo = "Unknown device") => {
  if (!deviceId) throw new ApiError(400, "Device ID is required");

  try {
    // Invalidate old sessions for this user & device
    await Session.updateMany({ userId: user._id, deviceId, valid: true }, { $set: { valid: false } });

    // Blacklist old tokens for this device
    if (userTokens[user._id]?.[deviceId]) {
      tokenBlacklist.push(...userTokens[user._id][deviceId]);
    }

    // === Generate Tokens ===
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, type: "access" },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } // e.g. "15m"
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, type: "refresh" },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } // e.g. "7d"
    );

    // Decode tokens to get expiration timestamps
    const decodedAccess = jwt.decode(accessToken);
    const decodedRefresh = jwt.decode(refreshToken);

    const accessExpiresAt = new Date(decodedAccess.exp * 1000);
    const refreshExpiresAt = new Date(decodedRefresh.exp * 1000);

    // === Save session in DB ===
    await Session.create({
      userId: user._id,
      deviceId,
      deviceInfo,
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      valid: true,
    });

    // === Cache the new tokens ===
    if (!userTokens[user._id]) userTokens[user._id] = {};
    userTokens[user._id][deviceId] = [accessToken, refreshToken];

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      refreshExpiresIn: config.jwt.refreshExpiresIn,
    };
  } catch (err) {
    console.error("Token creation failed:", err);
    throw new ApiError(500, "Error generating tokens");
  }
};

export const formatTokensToSnakeCase = (tokens) => {
  // Validate tokens object
  if (!tokens || !tokens.accessToken || !tokens.refreshToken || !tokens.expiresIn || !tokens.refreshExpiresIn) {
    throw new ApiError(500, "Invalid tokens object");
  }

  // Format tokens in snake_case
  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires_in: tokens.expiresIn,
    refresh_expires_in: tokens.refreshExpiresIn,
  };
};
