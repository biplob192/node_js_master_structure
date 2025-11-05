// src/routes/auth.routes.js

import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { register, login, logout, logoutCurrentDevice } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/logout-current-device", authMiddleware, logoutCurrentDevice);

export default router;
