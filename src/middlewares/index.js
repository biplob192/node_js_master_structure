// src/middlewares/index.js

import express from "express";
import { requestLogger } from "./logger.middleware.js";
import { errorHandler } from "./error.middleware.js";

// Optionally, you can import body-parser, cors, helmet, morgan, etc.
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

export const registerMiddlewares = (app) => {
  // Security headers
  app.use(helmet());

  // Enable CORS
  app.use(cors());

  // Logging
  app.use(morgan("dev"));
  app.use(requestLogger);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Later: you could register rate limiting, compression, etc.

  // Register error handler, catch all errors (should be the last one)
  // It should be registered in app.js after all routes
  // app.use(errorHandler);
};
