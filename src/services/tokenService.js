import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config.js";

export const generateAccessToken = (user) => {
  const jti = crypto.randomUUID();
  const accessToken = jwt.sign({ id: user.id, email: user.email, jti, type: "access" }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  const decoded = jwt.decode(accessToken);
  return { accessToken, accessJti: jti, expiresAt: new Date(decoded.exp * 1000) };
};

export const generateRefreshToken = (user) => {
  const jti = crypto.randomUUID();
  const refreshToken = jwt.sign({ id: user.id, email: user.email, jti, type: "refresh" }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  const decoded = jwt.decode(refreshToken);
  return { refreshToken, jti, refreshExpiresAt: new Date(decoded.exp * 1000) };
};

export const isRefreshTokenNearExpiry = (session, thresholdMs = 24 * 60 * 60 * 1000) => {
  return session.refreshExpiresAt.getTime() - Date.now() < thresholdMs;
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

export const parseExpiryMs = (exp) => {
  const num = parseInt(exp);
  if (exp.endsWith("m")) return num * 60 * 1000;
  if (exp.endsWith("h")) return num * 60 * 60 * 1000;
  if (exp.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return num;
};
