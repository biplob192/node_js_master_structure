// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isTokenBlacklisted } from "../services/user.service.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Missing or invalid token");
  }

  const token = authHeader.split(" ")[1];

  if (await isTokenBlacklisted(token)) {
    throw new ApiError(401, "Token has been logged out");
  }

  const decoded = jwt.verify(token, config.jwt.secret);

  req.user = {
    id: decoded.id,
    email: decoded.email,
    exp: decoded.exp,
  };
  next();
});

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       throw new ApiError(401, "Unauthorized: Missing or invalid token");
//     }

//     const token = authHeader.split(" ")[1];

//     if (await isTokenBlacklisted(token)) {
//       throw new ApiError(401, "Token has been logged out");
//     }

//     const decoded = jwt.verify(token, config.jwt.secret);

//     // Normalize to a consistent structure
//     req.user = {
//       id: decoded.id,
//       email: decoded.email,
//       exp: decoded.exp, // optional, used to show expiry
//     };
//     next();
//   } catch (err) {
//     // throw new ApiError(401, "Invalid or expired token");
//     next(err);
//   }
// };
