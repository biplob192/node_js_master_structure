// Middleware to convert response keys to snake_case
// src/middlewares/snakeCaseResponse.middleware.js

import { toSnakeCase } from "../utils/case.util.js";

export const snakeCaseResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const snakeData = toSnakeCase(data);
    return originalJson.call(this, snakeData);
  };

  next();
};
