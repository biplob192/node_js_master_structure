// src/app.js

import express from "express";
import allRoutes from "./routes/index.js";
import { registerMiddlewares } from "./middlewares/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Register all global middlewares (CORS, helmet, JSON parsing, logging, etc.)
registerMiddlewares(app);

// Mount all routes
app.use(allRoutes);

// Register error handler (after routes!)
app.use(errorHandler);

export default app;
