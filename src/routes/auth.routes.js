// src/routes/auth.routes.js

import express from "express";

const router = express.Router();

// Example routes
router.post("/login", (req, res) => {
  res.json({ message: "Login route" });
});

router.post("/register", (req, res) => {
  res.json({ message: "Register route" });
});

export default router;
