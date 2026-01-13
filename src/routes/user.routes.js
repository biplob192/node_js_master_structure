// src/routes/user.routes.js

import express from "express";
import { wrapRoutes } from "../utils/wrapRoutes.js";
import { index, getProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes
router.use(authMiddleware);
router.get("/", index);
router.get("/profile", getProfile);
// router.put("/profile", updateProfile);

// Wrap all route handlers with asyncHandler
export default wrapRoutes(router);
