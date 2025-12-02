import jwt from "jsonwebtoken";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";
import { decryptToken } from "../utils/tokenCrypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Session from "../models/session.model.js";

export const refreshTokenMiddleware = asyncHandler(async (req, res, next) => {
  let { refreshToken } = req.body;

  // Allow refresh token via Bearer header as well
  if (!refreshToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.split(" ")[1];
    }
  }

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  // STEP 1 — Decrypt encrypted refresh token from client
  const rawRefreshToken = decryptToken(refreshToken);

  // STEP 2 — Verify decoded refresh JWT
  const decoded = jwt.verify(rawRefreshToken, config.jwt.refreshSecret);

  // STEP 3 — Check session from DB
  const session = await Session.findOne({
    userId: decoded.id,
    refreshToken: rawRefreshToken, // must match RAW token
    valid: true,
  });

  if (!session) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // STEP 4 — Attach to request for controller
  req.session = session;
  req.refreshToken = rawRefreshToken;
  req.decodedRefreshToken = decoded;

  next();
});

// export const refreshTokenMiddleware = async (req, res, next) => {
//   try {
//     // Get token from body or Authorization header
//     let { refreshToken } = req.body;

//     if (!refreshToken && req.headers.authorization) {
//       const authHeader = req.headers.authorization;
//       if (authHeader.startsWith("Bearer ")) {
//         refreshToken = authHeader.split(" ")[1];
//       }
//     }

//     if (!refreshToken) {
//       throw new ApiError(400, "Refresh token is required");
//     }

//     // Verify refresh token
//     const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

//     // Check if session exists and is valid
//     const session = await Session.findOne({
//       userId: decoded.id,
//       refreshToken,
//       valid: true,
//     });

//     if (!session) {
//       throw new ApiError(401, "Invalid or expired refresh token");
//     }

//     // Attach session and decoded token to request for the controller
//     req.session = session;
//     req.refreshToken = refreshToken;
//     req.decodedRefreshToken = decoded;

//     next();
//   } catch (err) {
//     next(err); // Global error handler will handle it
//   }
// };
