// src/routes/index.routes.js
import express from "express";

const router = express.Router();

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to MyNodeApp API!",
    version: "1.0.0",
    status: "OK",
  });
});

export default router;
