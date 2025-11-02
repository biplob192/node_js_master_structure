// src/middlewares/auth.middleware.js

export const authenticate = (req, res, next) => {
  // Example stub — real version would check JWT, etc.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ status: "fail", message: "Unauthorized" });
  }
  next();
};
