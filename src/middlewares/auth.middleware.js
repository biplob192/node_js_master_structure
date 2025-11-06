// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import Session from "../models/session.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isTokenBlacklisted } from "../services/auth.service.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Missing or invalid token");
  }

  const accessToken = authHeader.split(" ")[1];

  if (await isTokenBlacklisted(accessToken)) {
    throw new ApiError(401, "Token has been logged out");
  }

  // Verify JWT Signature
  const decoded = jwt.verify(accessToken, config.jwt.secret);

  // Check if session exists and still valid
  const session = await Session.findOne({ accessToken, valid: true });
  if (!session) {
    throw new ApiError(401, "Session expired or logged out");
  }

  // Attach user info to request object
  req.user = {
    id: decoded.id,
    email: decoded.email,
  };

  // Attach tokens and their expiry to request object
  req.accessToken     = accessToken;
  req.refreshToken    = session.refreshToken;
  req.accessTokenExp  = decoded.exp;
  req.refreshTokenExp = session.refreshExpiresAt;

  // Proceed to next middleware/controller
  next();
});
