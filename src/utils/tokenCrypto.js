// src/utils/tokenCrypto.js

import crypto from "crypto";
import config from "../config/config.js";
import ApiError from "../utils/ApiError.js";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM
const KEYID_LENGTH = 2; // bytes to store keyId (string short format)

// Encrypt JWT Token
// export function encryptToken(token) {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const key = Buffer.from(config.jwt.encryptionKey, "hex");

//   const cipher = crypto.createCipheriv(ALGO, key, iv);
//   const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
//   const tag = cipher.getAuthTag();

//   return Buffer.concat([iv, tag, encrypted]).toString("base64");
// }

// // Decrypt JWT Token
// export function decryptToken(encryptedToken) {
//   const data = Buffer.from(encryptedToken, "base64");
//   const key = Buffer.from(config.jwt.encryptionKey, "hex");

//   const iv = data.subarray(0, 12);
//   const tag = data.subarray(12, 28);
//   const encrypted = data.subarray(28);

//   const decipher = crypto.createDecipheriv(ALGO, key, iv);
//   decipher.setAuthTag(tag);

//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
//   return decrypted.toString("utf8");
// }

// Encrypt JWT Token
export function encryptToken(token) {
  const keyId = config.jwt.currentEncryptionKeyId;
  const key = Buffer.from(config.jwt.encryptionKeys[keyId], "hex");

  if (!key) throw new Error(`Encryption key not found for keyId: ${keyId}`);

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Convert keyId => 2 bytes (max 65k key versions)
  const keyIdBuf = Buffer.alloc(KEYID_LENGTH);
  keyIdBuf.writeUInt16BE(parseInt(keyId.replace("v", "")), 0);

  // Final output format
  const full = Buffer.concat([keyIdBuf, iv, tag, encrypted]);

  return full.toString("base64");
}

// Decrypt JWT Token
// export function decryptToken(encryptedToken) {
//   const data = Buffer.from(encryptedToken, "base64");

//   // Extract keyId
//   const keyIdNumber = data.readUInt16BE(0);
//   const keyId = "v" + keyIdNumber;

//   const key = config.jwt.encryptionKeys[keyId];
//   if (!key) throw new Error(`Unknown encryption keyId: ${keyId}`);

//   const keyBuf = Buffer.from(key, "hex");

//   // Extract parts
//   const iv = data.subarray(2, 2 + IV_LENGTH);
//   const tag = data.subarray(2 + IV_LENGTH, 2 + IV_LENGTH + 16);
//   const encrypted = data.subarray(2 + IV_LENGTH + 16);

//   const decipher = crypto.createDecipheriv(ALGO, keyBuf, iv);
//   decipher.setAuthTag(tag);

//   const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

//   return decrypted.toString("utf8");
// }

export function decryptToken(encryptedToken) {
  try {
    if (!encryptedToken) {
      throw new ApiError(400, "Missing token");
    }

    const data = Buffer.from(encryptedToken, "base64");

    if (data.length < 30) {
      throw new ApiError(401, "Invalid or corrupted token");
    }

    // Read keyId
    const keyIdNumber = data.readUInt16BE(0);
    const keyId = "v" + keyIdNumber;

    const keyHex = config.jwt.encryptionKeys[keyId];
    if (!keyHex) {
      throw new ApiError(401, "Token encrypted with unknown key");
    }

    const key = Buffer.from(keyHex, "hex");

    const iv = data.subarray(2, 14);
    const tag = data.subarray(14, 30);
    const encrypted = data.subarray(30);

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.warn("Token decryption error:", err.message);

    // Crypto errors = invalid token, not server error
    if (err instanceof ApiError) {
      throw err;
    }

    // GCM authentication failure OR corrupted input
    if (
      err.message.includes("unable to authenticate") ||
      err.message.includes("auth tag") ||
      err.message.includes("wrong final block length") ||
      err.message.includes("bad decrypt")
    ) {
      throw new ApiError(401, "Invalid or corrupted token");
    }

    // Other errors
    throw new ApiError(400, "Invalid token format");
  }
}
