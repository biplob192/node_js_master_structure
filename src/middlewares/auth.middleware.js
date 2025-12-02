// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import Session from "../models/session.model.js";
import { decryptToken } from "../utils/tokenCrypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isTokenBlacklisted } from "../services/auth.service.js";

// This middleware is for protected routes that require authentication.
// It verifies the encrypted JWT token and checks if the session is still valid.
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Missing or invalid token");
  }

  const encryptedToken = authHeader.split(" ")[1];

  // STEP 1 — decrypt token (if fails, it will throw & global handler catches it)
  const accessToken = decryptToken(encryptedToken);

  // STEP 2 — check blacklist using RAW token
  if (await isTokenBlacklisted(accessToken)) {
    throw new ApiError(401, "Token has been logged out");
  }

  // STEP 3 — verify JWT signature (throws automatically if invalid/expired)
  const decoded = jwt.verify(accessToken, config.jwt.secret);

  // STEP 4 — check if session exists and still valid
  const session = await Session.findOne({ accessToken, valid: true });

  if (!session) {
    throw new ApiError(401, "Session expired or logged out");
  }

  // STEP 5 — attach user data to request
  req.user = {
    id: decoded.id,
    email: decoded.email,
  };

  req.accessToken = accessToken;
  req.refreshToken = session.refreshToken;
  req.accessTokenExp = decoded.exp;
  req.refreshTokenExp = session.refreshExpiresAt;

  // Proceed to next middleware/controller
  next();
});

// It verifies the raw JWT token and checks if the session is still valid.
// export const authMiddleware = asyncHandler(async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new ApiError(401, "Unauthorized: Missing or invalid token");
//   }

//   const accessToken = authHeader.split(" ")[1];

//   // Check if token is blacklisted (for in memory token blacklist)
//   if (await isTokenBlacklisted(accessToken)) {
//     throw new ApiError(401, "Token has been logged out");
//   }

//   // Verify JWT Signature and decode
//   const decoded = jwt.verify(accessToken, config.jwt.secret);

//   // Check if session exists and still valid
//   const session = await Session.findOne({ accessToken, valid: true });
//   if (!session) {
//     throw new ApiError(401, "Session expired or logged out");
//   }

//   // Attach user info to request object
//   req.user = {
//     id: decoded.id,
//     email: decoded.email,
//   };

//   // Attach tokens and their expiry to request object
//   req.accessToken     = accessToken;
//   req.refreshToken    = session.refreshToken;
//   req.accessTokenExp  = decoded.exp;
//   req.refreshTokenExp = session.refreshExpiresAt;

//   // Proceed to next middleware/controller
//   next();
// });
