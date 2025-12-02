// src/utils/tokenCrypto.js

import crypto from "crypto";
import config from "../config/config.js";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

// Encrypt JWT Token
export function encryptToken(token) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(config.jwt.encryptionKey, "hex");

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

// Decrypt JWT Token
export function decryptToken(encryptedToken) {
  const data = Buffer.from(encryptedToken, "base64");
  const key = Buffer.from(config.jwt.encryptionKey, "hex");

  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
