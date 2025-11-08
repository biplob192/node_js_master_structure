import jwt from "jsonwebtoken";
import config from "../config/config";
import ApiError from "../utils/ApiError";
import Session from "../models/session.model";

export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    // Get token from body or Authorization header
    let { refreshToken } = req.body;

    if (!refreshToken && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        refreshToken = authHeader.split(" ")[1];
      }
    }

    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Check if session exists and is valid
    const session = await Session.findOne({
      userId: decoded.id,
      refreshToken,
      valid: true,
    });

    if (!session) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Attach session and decoded token to request for the controller
    req.session = session;
    req.refreshToken = refreshToken;
    req.decodedRefreshToken = decoded;

    next();
  } catch (err) {
    next(err); // Global error handler will handle it
  }
};
