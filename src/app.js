// src/app.js

import express from "express";
import allRoutes from "./routes/index.js";

const app = express();

// Built-in middleware to parse JSON
app.use(express.json());

// Mount all routes
app.use(allRoutes);

// Error handling middleware (catch errors)
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
