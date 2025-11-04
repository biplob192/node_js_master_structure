// src/routes/auth.routes.js

import express from "express";
import { register, login, logout } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
