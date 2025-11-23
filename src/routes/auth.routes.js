// src/routes/auth.routes.js

import express from "express";
import { wrapRoutes } from "../utils/wrapRoutes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { refreshTokenMiddleware } from "../middlewares/refreshToken.middleware.js";
import { register, login, logout, verifyOtp, sendOtp, logoutOtherDevices, refreshToken } from "../controllers/auth.controller.js";

const router = express.Router();

// Sample full API endpoints for this router:
// POST   /api/auth/register         - Register a new user
// POST   /api/auth/verify-otp       - Verify OTP for user verification
// POST   /api/auth/login            - Login user and get JWT
// POST   /api/auth/logout           - Logout user (invalidate current token)
// POST   /api/auth/logout-others    - Logout from other devices
// POST   /api/auth/send-otp       - Send OTP to user

// --------------------
// Public routes
// --------------------
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", refreshTokenMiddleware, refreshToken);

// --------------------
// Protected routes (requires valid JWT)
// --------------------
router.use(authMiddleware);
router.post("/logout", logout);
router.post("/logout-others", logoutOtherDevices);

/**
 * Wrap all route handlers with `asyncHandler` before exporting.
 * This ensures that any asynchronous errors in controllers are automatically
 * caught and sent to the global error handler.
 * With this in place, controllers do not need try/catch blocks.
 */
export default wrapRoutes(router);
