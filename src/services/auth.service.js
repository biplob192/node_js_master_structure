// src/services/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import Session from "../models/session.model.js";
import { generateAccessToken, generateRefreshToken, isRefreshTokenNearExpiry, formatTokensToSnakeCase } from "./tokenService.js";

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
export const verifyUserAndGenerateTokenService = async (userId, deviceId, deviceInfo) => {
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
export const loginUserService = async (data) => {
  const { email, password, deviceId } = data;
  const deviceInfo = data.deviceInfo || "Unknown device";

  const emailLower = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailLower });
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
export const createToken_ = async (user, deviceId, deviceInfo = "Unknown device") => {
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

export const createToken = async (user, deviceId, deviceInfo = "Unknown device") => {
  if (!deviceId) throw new ApiError(400, "Device ID is required");

  // Extract user details
  const userId = user._id;
  const email = user.email;

  try {
    // Invalidate old sessions & blacklist old tokens
    await Session.updateMany({ userId, deviceId, valid: true }, { $set: { valid: false } });
    if (userTokens[userId]?.[deviceId]) {
      tokenBlacklist.push(...userTokens[userId][deviceId]);
    }

    // Generate new tokens
    const { accessToken, expiresAt: accessExpiresAt } = generateAccessToken({ id: userId, email });
    const { refreshToken, refreshExpiresAt } = generateRefreshToken({ id: userId, email });

    // Create session in DB with new tokens
    await Session.create({
      userId,
      deviceId,
      deviceInfo,
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      valid: true,
    });

    // Cache the new tokens for this device and user
    userTokens[userId] = userTokens[userId] || {};
    userTokens[userId][deviceId] = [accessToken, refreshToken];

    // Return tokens + expiry info
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

export const verifyUserExistenceService = async (value) => {
  // Destructure value to get email or userId
  const { email, userId } = value;

  // If userId not provided, find user by email
  let user;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email });
  }

  if (!user) throw new ApiError(404, "User not found");

  return user;
};

export const refreshTokenService = async (userId, refreshToken, rotateAllTokens = false) => {
  // Check if session exists and is valid
  const session = await Session.findOne({ userId, refreshToken, valid: true });
  if (!session) throw new ApiError(401, "Invalid or expired session");

  // Always generate new access token and update session with the token
  const { accessToken, expiresAt } = generateAccessToken({ id: userId, email: session.email });
  session.accessToken = accessToken;
  session.accessExpiresAt = expiresAt;

  // Rotate refresh token too, if requested or if it's close to expiry (e.g., less than 1 day left)
  let newRefreshToken;
  if (rotateAllTokens || isRefreshTokenNearExpiry(session)) {
    const { refreshToken, refreshExpiresAt } = generateRefreshToken({ id: userId, email: session.email });
    newRefreshToken = refreshToken;
    session.refreshToken = refreshToken;
    session.refreshExpiresAt = refreshExpiresAt;

    // Console log for debugging or monitoring
    console.log(`Rotated refresh token for user ${session.email}`);
  }

  // Save updated session
  await session.save();

  // Prepare response
  const response = {
    access_token: accessToken,
    expires_in: config.jwt.expiresIn,
  };

  if (newRefreshToken) {
    response.refresh_token = newRefreshToken;
    response.refresh_expires_in = config.jwt.refreshExpiresIn;
  }

  return response;
};

// Invalidate all sessions for a user except the provided token
// Not used currently, but can be useful for future features
export const invalidateUserSessions = async (userId, excludeToken = null) => {
  const filter = { userId, valid: true };
  if (excludeToken) {
    filter.accessToken = { $ne: excludeToken };
  }
  await Session.updateMany(filter, { $set: { valid: false } });
};

// --------------------
// END OF FILE
// --------------------
