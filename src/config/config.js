// ./config/config.js

import { tr } from "@faker-js/faker";

const config = {
  // Application info
  app: {
    name: process.env.APP_NAME || "MyNodeApp",
    version: process.env.APP_VERSION || "1.0.0",
    port: process.env.PORT || 5000,
    baseUrl: process.env.BASE_URL || "http://localhost:5000",
    env: process.env.NODE_ENV || "development", // development | production | staging
  },

  // Database configuration
  db: {
    uri: process.env.DB_URI || "mongodb://localhost:27017/myapp",
    type: process.env.DB_TYPE || "mongodb", // mongodb | mysql | postgres
    username: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 27017,
    database: process.env.DB_NAME || "myapp",
    poolSize: parseInt(process.env.DB_POOL_SIZE) || 5,
  },

  // JWT / Authentication
  jwt: {
    secret: process.env.JWT_SECRET || "supersecretkey123",
    expiresIn: process.env.JWT_EXPIRES_IN || "6h",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refreshsecret123",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    encryptionKey: process.env.JWT_ENCRYPTION_KEY || "937b6d59e3951a07bb0aa9b80a676ebddf4b85d9d5b04d1ded4492c66dae880e",
    // Generate encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

    // MULTIPLE encryption keys (for rotation)
    encryptionKeys: {
      // Key ID : Hex key
      v1: process.env.JWT_ENC_KEY_V1 || "937b6d59e3951a07bb0aa9b80a676ebddf4b85d9d5b04d1ded4492c66dae880e",
      v2: process.env.JWT_ENC_KEY_V1 || "0de70d7d08974bd3e435e16ffd28b9510833552ddb6f3ad887332455df6e8bd2",
      // Add new rotated key here later:
      // "v3": process.env.JWT_ENC_KEY_V3,
    },

    // Active key used to encrypt new tokens
    currentEncryptionKeyId: process.env.JWT_CURRENT_ENC_KEY_ID || "v1",
  },

  // Email / SMTP configuration
  mail: {
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT) || 2525,
    user: process.env.SMTP_USER || "5ab82c11130611",
    pass: process.env.SMTP_PASS || "db3b1a0be9cd3c",
    fromName: process.env.MAIL_FROM_NAME || "MyNodeApp",
    fromEmail: process.env.MAIL_FROM_EMAIL || "noreply@example.com",
  },

  // SMS / Twilio configuration
  twilio: {
    sid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // OTP configuration
  otp: {
    cooldownMs: parseInt(process.env.OTP_COOLDOWN_MS) || 2 * 60 * 1000, // default 2 minute
    expiryMs: parseInt(process.env.OTP_EXPIRY_MS) || 10 * 60 * 1000, // default 10 minutes
  },

  // Third-party APIs
  api: {
    baseUrl: process.env.API_BASE_URL || "https://api.example.com",
    timeout: parseInt(process.env.API_TIMEOUT) || 5000, // ms
    keys: {
      googleMaps: process.env.GOOGLE_MAPS_API_KEY || "",
      stripe: process.env.STRIPE_API_KEY || "",
      awsS3: process.env.AWS_S3_KEY || "",
    },
  },

  // Logging
  logger: {
    level: process.env.LOG_LEVEL || "info", // error | warn | info | debug
    output: process.env.LOG_OUTPUT || "console", // console | file | remote
    filePath: process.env.LOG_FILE_PATH || "./logs/app.log",
  },

  // Caching
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // seconds
    provider: process.env.CACHE_PROVIDER || "memory", // memory | redis
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  },

  // Redis
  redis: {
    enabled: true,
    // host: process.env.REDIS_HOST || "127.0.0.1",
    // port: process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD || undefined,
  },

  // Features / feature flags
  features: {
    enableSignup: process.env.FEATURE_ENABLE_SIGNUP !== "false", // default true
    enableDebugLogs: process.env.FEATURE_ENABLE_DEBUG !== "false", // default false
    enableNotifications: process.env.FEATURE_ENABLE_NOTIFICATIONS !== "false",
  },

  // Security
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || "*").split(","), // comma-separated
    rateLimit: parseInt(process.env.RATE_LIMIT) || 100, // requests per window
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    helmet: process.env.ENABLE_HELMET !== "false",
  },

  // File upload / storage
  storage: {
    localPath: process.env.STORAGE_LOCAL_PATH || "./uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || "image/jpeg,image/png,application/pdf").split(","),
  },
};

export default config;
