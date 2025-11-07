// src/middlewares/normalizeKeys.middleware.js

export const normalizeKeys = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    const newBody = {};
    for (const key in req.body) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newBody[camelKey] = req.body[key];
    }
    req.body = newBody;
  }
  next();
};

// Usage example in an Express app:
// import { normalizeKeys } from "../middlewares/normalizeKeys.middleware.js";
// app.use(normalizeKeys);