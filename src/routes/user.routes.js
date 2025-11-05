// src/routes/user.routes.js

import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserProfile } from "../services/user.service.js";
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router();

// GET /api/users/profile
router.get("/profile", authMiddleware, getProfile);

// router.get("/profile", authMiddleware, async (req, res, next) => {
//   try {
//     const profileData = await getUserProfile(req.user.id, req.user.exp);
//     return ApiResponse.success(res, "Profile fetched successfully", profileData);
//   } catch (err) {
//     next(err);
//   }
// });

export default router;
